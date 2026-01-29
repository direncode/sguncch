#!/usr/bin/env python3
"""
UFE Hook for Project Bold - Real-Time Governance Data Sync

Connects to the actual Project Bold data sources and pushes
policy state to the Undercurrent Flux Engine for analysis.

Data Sources (in priority order):
1. Supabase database (if configured)
2. Local API endpoint (if running)
3. Static initial data (fallback)

Usage:
    from ufe_hook import hook
    hook.start()  # Start background sync every 60s

    # Or manual push:
    hook.push()
"""

import json
import os
import threading
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from ufe_integration import UFEIntegration, PolicyState

# Try to import supabase client
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("[UFE] supabase-py not installed. Using fallback data sources.")

# Try to import httpx for API calls
try:
    import httpx
    HTTPX_AVAILABLE = True
except ImportError:
    HTTPX_AVAILABLE = False


class UFEHook:
    """
    Hook to sync Project Bold governance data with UFE.

    Fetches real policy data from Supabase or local sources
    and pushes to UFE for energy landscape analysis.
    """

    def __init__(self, interval: int = 60):
        """
        Initialize the UFE hook.

        Args:
            interval: Sync interval in seconds (default: 60)
        """
        self.ufe = UFEIntegration()
        self.interval = interval
        self.running = False
        self._thread: Optional[threading.Thread] = None
        self._last_result: Optional[Dict] = None
        self._push_count = 0

        # Initialize Supabase client if available
        self.supabase: Optional[Client] = None
        self._init_supabase()

        # Track historical states for trajectory analysis
        self._state_history: List[PolicyState] = []
        self._max_history = 10

    def _init_supabase(self):
        """Initialize Supabase client from environment variables."""
        if not SUPABASE_AVAILABLE:
            return

        url = os.getenv('NEXT_PUBLIC_SUPABASE_URL') or os.getenv('SUPABASE_URL')
        key = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY') or os.getenv('SUPABASE_ANON_KEY')

        if url and key:
            try:
                self.supabase = create_client(url, key)
                print(f"[UFE] Connected to Supabase: {url[:30]}...")
            except Exception as e:
                print(f"[UFE] Failed to connect to Supabase: {e}")
                self.supabase = None

    def _fetch_from_supabase(self) -> Optional[Dict[str, Any]]:
        """Fetch current state from Supabase database."""
        if not self.supabase:
            return None

        try:
            # Fetch policies
            policies_resp = self.supabase.table('policies').select('*').execute()
            policies = policies_resp.data if policies_resp.data else []

            # Convert snake_case to camelCase for consistency
            policies = [self._convert_policy(p) for p in policies]

            # Fetch quick stats
            stats_resp = self.supabase.table('quick_stats').select('*').limit(1).execute()
            quick_stats = stats_resp.data[0] if stats_resp.data else {}
            quick_stats = {
                'totalStudentsReached': quick_stats.get('total_students_reached', 0),
                'activeInitiatives': quick_stats.get('active_initiatives', 0),
                'eventsThisMonth': quick_stats.get('events_this_month', 0),
                'feedbackReceived': quick_stats.get('feedback_received', 0),
            }

            # Fetch budget
            budget_resp = self.supabase.table('budget').select('*').limit(1).execute()
            budget = budget_resp.data[0] if budget_resp.data else {}
            budget = {
                'total': float(budget.get('total', 0)),
                'allocated': float(budget.get('allocated', 0)),
                'spent': float(budget.get('spent', 0)),
            }

            # Fetch operational data
            operational = self._fetch_operational_from_supabase()

            return {
                'policies': policies,
                'quickStats': quick_stats,
                'budget': budget,
                'operational': operational,
                'source': 'supabase',
                'timestamp': datetime.now().isoformat(),
            }

        except Exception as e:
            print(f"[UFE] Supabase fetch error: {e}")
            return None

    def _fetch_operational_from_supabase(self) -> Dict[str, Any]:
        """Fetch operational data from Supabase."""
        operational = {}

        try:
            # Tech devices
            devices_resp = self.supabase.table('tech_devices').select('*').execute()
            if devices_resp.data:
                operational['techLoaners'] = {
                    'devices': [{
                        'id': d['id'],
                        'type': d['type'],
                        'name': d['name'],
                        'total': d.get('total', 0),
                        'available': d.get('available', 0),
                        'onLoan': d.get('on_loan', 0),
                    } for d in devices_resp.data]
                }

            # Pantry locations
            pantry_resp = self.supabase.table('pantry_locations').select('*').execute()
            if pantry_resp.data:
                operational['foodPantry'] = {
                    'locations': [{
                        'id': p['id'],
                        'name': p['name'],
                        'inventory': p.get('inventory', 'unknown'),
                        'visits': p.get('visits', 0),
                    } for p in pantry_resp.data]
                }

            # Pantry stats
            pantry_stats = self.supabase.table('pantry_stats').select('*').limit(1).execute()
            if pantry_stats.data:
                stats = pantry_stats.data[0]
                if 'foodPantry' not in operational:
                    operational['foodPantry'] = {}
                operational['foodPantry']['totalVisits'] = stats.get('total_visits', 0)
                operational['foodPantry']['donations'] = float(stats.get('donations', 0))

        except Exception as e:
            print(f"[UFE] Operational data fetch error: {e}")

        return operational

    def _convert_policy(self, policy: Dict) -> Dict:
        """Convert Supabase policy to expected format."""
        return {
            'id': policy.get('id'),
            'department': policy.get('department'),
            'title': policy.get('title'),
            'description': policy.get('description'),
            'status': policy.get('status', 'planned'),
            'priority': policy.get('priority', 'medium'),
            'progress': policy.get('progress', 0),
            'digitalFeatures': policy.get('digital_features', []),
            'metrics': policy.get('metrics', {}),
        }

    def _fetch_from_api(self, base_url: str = 'http://localhost:3000') -> Optional[Dict[str, Any]]:
        """Fetch current state from local API endpoint."""
        if not HTTPX_AVAILABLE:
            return None

        try:
            with httpx.Client(timeout=10.0) as client:
                resp = client.get(f"{base_url}/api/ufe/state")
                if resp.status_code == 200:
                    data = resp.json()
                    data['source'] = 'api'
                    return data
        except Exception as e:
            # API not available - this is fine, use fallback
            pass

        return None

    def _fetch_static_data(self) -> Dict[str, Any]:
        """Load static initial data as fallback."""
        # Import from ufe_demo which has the real policy data
        try:
            from ufe_demo import INITIAL_POLICIES, INITIAL_QUICK_STATS, INITIAL_BUDGET
            return {
                'policies': INITIAL_POLICIES,
                'quickStats': INITIAL_QUICK_STATS,
                'budget': INITIAL_BUDGET,
                'operational': {},
                'source': 'static',
                'timestamp': datetime.now().isoformat(),
            }
        except ImportError:
            # Fallback to minimal data
            return {
                'policies': [],
                'quickStats': {
                    'totalStudentsReached': 0,
                    'activeInitiatives': 0,
                    'eventsThisMonth': 0,
                    'feedbackReceived': 0,
                },
                'budget': {'total': 50000, 'allocated': 0, 'spent': 0},
                'operational': {},
                'source': 'minimal',
                'timestamp': datetime.now().isoformat(),
            }

    def _fetch_real_data(self) -> List[PolicyState]:
        """
        Fetch real data from available sources and return as PolicyState objects.

        Priority:
        1. Supabase database (production)
        2. Local API endpoint (development)
        3. Static data (fallback)

        Returns:
            List of PolicyState objects for trajectory analysis
        """
        # Try data sources in priority order
        data = None

        # 1. Try Supabase
        if self.supabase:
            data = self._fetch_from_supabase()

        # 2. Try local API
        if data is None:
            data = self._fetch_from_api()

        # 3. Fall back to static data
        if data is None:
            data = self._fetch_static_data()

        # Convert to PolicyState
        current_state = PolicyState(
            policies=data.get('policies', []),
            quick_stats=data.get('quickStats', {}),
            budget=data.get('budget', {}),
            operational=data.get('operational', {}),
            timestamp=datetime.now()
        )

        # Add to history
        self._state_history.append(current_state)
        if len(self._state_history) > self._max_history:
            self._state_history = self._state_history[-self._max_history:]

        # Log the data source
        source = data.get('source', 'unknown')
        policy_count = len(data.get('policies', []))
        print(f"[UFE] Fetched {policy_count} policies from {source}")

        # Return recent history for trajectory analysis
        return self._state_history

    def push(self) -> Optional[Dict[str, Any]]:
        """
        Push current state to UFE for analysis.

        Returns:
            Analysis result dict or None on error
        """
        try:
            states = self._fetch_real_data()

            if not states:
                print("[UFE] No data to analyze")
                return None

            result = self.ufe.analyze(states)
            self._last_result = result
            self._push_count += 1

            # Print summary
            energy = result.get('energy', {})
            friction = result.get('friction', {})

            print(f"[UFE] Push #{self._push_count} - Energy: {energy.get('total_energy', 0):.4f}")
            print(f"      Trajectory Dev: {energy.get('trajectory_deviation', 0):.4f}")
            print(f"      Friction: stag={friction.get('stagnation_risk', 0):.3f}, eng={friction.get('engagement_drop', 0):.3f}")

            return result

        except Exception as e:
            print(f"[UFE] Push error: {e}")
            return None

    def start(self):
        """Start background sync loop."""
        if self.running:
            print("[UFE] Already running")
            return

        self.running = True

        def loop():
            print(f"[UFE] Background sync started (interval: {self.interval}s)")
            while self.running:
                self.push()
                time.sleep(self.interval)
            print("[UFE] Background sync stopped")

        self._thread = threading.Thread(target=loop, daemon=True)
        self._thread.start()

    def stop(self):
        """Stop background sync loop."""
        self.running = False
        if self._thread:
            self._thread.join(timeout=5)
            self._thread = None

    @property
    def last_result(self) -> Optional[Dict[str, Any]]:
        """Get the last analysis result."""
        return self._last_result

    @property
    def state_history(self) -> List[PolicyState]:
        """Get the state history for trajectory analysis."""
        return self._state_history.copy()


# Global hook instance
hook = UFEHook(interval=60)


def main():
    """Test the UFE hook with real data."""
    print("=" * 60)
    print("UFE HOOK - REAL DATA TEST")
    print("=" * 60)

    # Test single push
    print("\nTesting single push with real data...")
    result = hook.push()

    if result:
        print("\n" + "=" * 60)
        print("ANALYSIS RESULT")
        print("=" * 60)

        energy = result.get('energy', {})
        print(f"\nTotal Energy: {energy.get('total_energy', 0):.4f}")
        print(f"  Trajectory Deviation: {energy.get('trajectory_deviation', 0):.4f}")
        print(f"  Undercurrent Friction: {energy.get('undercurrent_friction', 0):.4f}")
        print(f"  Self-Prediction Error: {energy.get('self_prediction_error', 0):.4f}")

        friction = result.get('friction', {})
        print(f"\nFriction Breakdown:")
        for term, value in friction.items():
            if term != 'total':
                level = "LOW" if value < 0.3 else "MODERATE" if value < 0.6 else "HIGH"
                print(f"  {term}: {value:.4f} [{level}]")

        print(f"\nLatent Shape: {result.get('latent_shape', [])}")
        print(f"States Analyzed: {result.get('trajectory_length', 0)}")
    else:
        print("\nPush failed - check API connection")

    # Test background sync
    print("\n" + "=" * 60)
    print("BACKGROUND SYNC TEST")
    print("=" * 60)
    print("Starting 5-second background sync test...")

    hook.interval = 2  # Speed up for testing
    hook.start()

    time.sleep(5)

    hook.stop()
    print(f"\nTotal pushes: {hook._push_count}")
    print("Background sync test complete")


if __name__ == "__main__":
    main()
