"""
UFE Integration for Project Bold - Governance Policy Modeling

Maps Project Bold's policy data structures to UFE 32-dimensional feature vectors
for governance energy landscape analysis.

Feature Vector Layout (32 dimensions):
  [0-4]   Policy Status Metrics
  [5-9]   Engagement & Reach Metrics
  [10-14] Department Distribution
  [15-19] Priority & Urgency Indicators
  [20-24] Operational Health Metrics
  [25-29] Progress & Momentum Indicators
  [30-31] Friction Risk Factors (stagnation_risk, engagement_drop)

Friction Terms:
  - stagnation_risk: Policies stuck without progress, low update frequency
  - engagement_drop: Declining participation, low metric activity
"""

import math
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple

from ufe_client import UFEClient


# Policy data from lib/data.js - simulating what would come from the database
DEPARTMENTS = ['wellness', 'basic-needs', 'academic', 'communications', 'environmental']
STATUS_VALUES = {'planned': 0.0, 'in_progress': 0.5, 'completed': 1.0}
PRIORITY_VALUES = {'low': 0.33, 'medium': 0.66, 'high': 1.0}


class PolicyState:
    """Represents a snapshot of policy state at a point in time."""

    def __init__(
        self,
        policies: List[Dict[str, Any]],
        quick_stats: Optional[Dict[str, int]] = None,
        budget: Optional[Dict[str, Any]] = None,
        operational: Optional[Dict[str, Any]] = None,
        timestamp: Optional[datetime] = None
    ):
        self.policies = policies
        self.quick_stats = quick_stats or {
            'totalStudentsReached': 0,
            'activeInitiatives': 0,
            'eventsThisMonth': 0,
            'feedbackReceived': 0
        }
        self.budget = budget or {'total': 0, 'allocated': 0, 'spent': 0}
        self.operational = operational or {}
        self.timestamp = timestamp or datetime.now()


class UFEIntegration:
    """
    Integration layer between Project Bold policy data and UFE API.

    Converts governance policy states into 32-dimensional feature vectors
    for energy landscape analysis, friction detection, and trajectory prediction.
    """

    DOMAIN = "governance"
    FEATURE_DIM = 32

    def __init__(self):
        self.client = UFEClient()

    def to_features(self, state: PolicyState) -> List[float]:
        """
        Convert a PolicyState object to a 32-dimensional UFE feature vector.

        Feature mapping:
        [0]  Overall progress (0-1)
        [1]  Completed ratio
        [2]  In-progress ratio
        [3]  Planned ratio
        [4]  Active policy count (normalized)

        [5]  Students reached (log-normalized)
        [6]  Feedback received (log-normalized)
        [7]  Events this month (normalized)
        [8]  Average metric activity
        [9]  Digital feature coverage

        [10] Wellness department ratio
        [11] Basic-needs department ratio
        [12] Academic department ratio
        [13] Communications department ratio
        [14] Environmental department ratio

        [15] High priority ratio
        [16] Medium priority ratio
        [17] Low priority ratio
        [18] Urgency score (weighted priority)
        [19] Priority-progress alignment

        [20] Budget utilization (spent/allocated)
        [21] Budget allocation ratio (allocated/total)
        [22] Operational capacity
        [23] Resource availability
        [24] Service coverage

        [25] Average progress velocity
        [26] Completion momentum
        [27] Initiative diversity
        [28] Cross-department collaboration
        [29] Implementation depth

        [30] Stagnation risk indicator
        [31] Engagement drop indicator
        """
        features = [0.0] * self.FEATURE_DIM
        policies = state.policies
        n = len(policies) if policies else 1

        # [0-4] Policy Status Metrics
        progresses = [p.get('progress', 0) for p in policies]
        features[0] = sum(progresses) / (n * 100)  # Overall progress 0-1

        status_counts = self._count_by_status(policies)
        features[1] = status_counts.get('completed', 0) / n  # Completed ratio
        features[2] = status_counts.get('in_progress', 0) / n  # In-progress ratio
        features[3] = status_counts.get('planned', 0) / n  # Planned ratio
        features[4] = min(n / 30, 1.0)  # Active policy count normalized (30 = full)

        # [5-9] Engagement & Reach Metrics
        qs = state.quick_stats
        features[5] = self._log_normalize(qs.get('totalStudentsReached', 0), 10000)
        features[6] = self._log_normalize(qs.get('feedbackReceived', 0), 500)
        features[7] = min(qs.get('eventsThisMonth', 0) / 20, 1.0)
        features[8] = self._avg_metric_activity(policies)
        features[9] = self._digital_feature_coverage(policies)

        # [10-14] Department Distribution
        dept_counts = self._count_by_department(policies)
        for i, dept in enumerate(DEPARTMENTS):
            features[10 + i] = dept_counts.get(dept, 0) / n

        # [15-19] Priority & Urgency Indicators
        priority_counts = self._count_by_priority(policies)
        features[15] = priority_counts.get('high', 0) / n
        features[16] = priority_counts.get('medium', 0) / n
        features[17] = priority_counts.get('low', 0) / n
        features[18] = self._urgency_score(policies)
        features[19] = self._priority_progress_alignment(policies)

        # [20-24] Operational Health Metrics
        budget = state.budget
        allocated = budget.get('allocated', 0) or 1
        total = budget.get('total', 0) or 1
        features[20] = min(budget.get('spent', 0) / allocated, 1.0) if allocated else 0
        features[21] = min(allocated / total, 1.0) if total else 0
        features[22] = self._operational_capacity(state.operational)
        features[23] = self._resource_availability(state.operational)
        features[24] = self._service_coverage(policies)

        # [25-29] Progress & Momentum Indicators
        features[25] = self._progress_velocity(policies)
        features[26] = self._completion_momentum(policies)
        features[27] = self._initiative_diversity(policies)
        features[28] = self._cross_dept_collaboration(policies)
        features[29] = self._implementation_depth(policies)

        # [30-31] Friction Risk Factors
        features[30] = self._stagnation_risk(policies, state)
        features[31] = self._engagement_drop_risk(policies, state)

        return features

    def from_latent(self, latent: List[float]) -> Dict[str, Any]:
        """
        Interpret latent space vector back to governance concepts.

        Returns high-level interpretations rather than exact inverse mapping.
        """
        # Compute magnitude in different latent subspaces
        n = len(latent)

        # Split latent into conceptual regions
        status_region = latent[:64]
        engagement_region = latent[64:128]
        operational_region = latent[128:192]
        momentum_region = latent[192:]

        return {
            'status_intensity': self._vector_magnitude(status_region),
            'engagement_intensity': self._vector_magnitude(engagement_region),
            'operational_intensity': self._vector_magnitude(operational_region),
            'momentum_intensity': self._vector_magnitude(momentum_region),
            'overall_activation': self._vector_magnitude(latent),
            'balance_score': self._latent_balance(latent),
        }

    def analyze(self, states: List[PolicyState]) -> Dict[str, Any]:
        """
        Analyze a sequence of policy states through UFE.

        Args:
            states: List of PolicyState objects representing temporal evolution

        Returns:
            Dict with energy analysis, latent encoding, and predictions
        """
        # Convert states to feature trajectory
        trajectory = [[self.to_features(s) for s in states]]

        # Call UFE API endpoints
        energy = self.client.energy(trajectory, self.DOMAIN)
        encoded = self.client.encode(trajectory, self.DOMAIN)

        # Get last latent vector for prediction
        latent_vectors = encoded.get("latent", [[]])
        if latent_vectors and latent_vectors[0]:
            last_latent = [latent_vectors[0][-1]]
            prediction = self.client.predict(last_latent, num_steps=10)
        else:
            prediction = {"shape": [0, 0, 0]}

        return {
            "energy": energy,
            "latent_shape": encoded.get("shape", []),
            "prediction_shape": prediction.get("shape", []),
            "friction": energy.get("friction_breakdown", {}),
            "trajectory_length": len(states),
            "feature_dim": self.FEATURE_DIM,
        }

    def analyze_single(self, state: PolicyState) -> Dict[str, Any]:
        """Analyze a single policy state snapshot."""
        return self.analyze([state])

    # =========================================================================
    # Helper methods for feature computation
    # =========================================================================

    def _log_normalize(self, value: float, scale: float) -> float:
        """Log-normalize a value to 0-1 range."""
        if value <= 0:
            return 0.0
        return min(math.log1p(value) / math.log1p(scale), 1.0)

    def _count_by_status(self, policies: List[Dict]) -> Dict[str, int]:
        """Count policies by status."""
        counts = {'completed': 0, 'in_progress': 0, 'planned': 0}
        for p in policies:
            status = p.get('status', 'planned')
            if status in counts:
                counts[status] += 1
        return counts

    def _count_by_department(self, policies: List[Dict]) -> Dict[str, int]:
        """Count policies by department."""
        counts = {d: 0 for d in DEPARTMENTS}
        for p in policies:
            dept = p.get('department', '')
            if dept in counts:
                counts[dept] += 1
        return counts

    def _count_by_priority(self, policies: List[Dict]) -> Dict[str, int]:
        """Count policies by priority level."""
        counts = {'high': 0, 'medium': 0, 'low': 0}
        for p in policies:
            priority = p.get('priority', 'medium')
            if priority in counts:
                counts[priority] += 1
        return counts

    def _avg_metric_activity(self, policies: List[Dict]) -> float:
        """Calculate average metric activity across all policies."""
        total_activity = 0
        metric_count = 0

        for p in policies:
            metrics = p.get('metrics', {})
            for key, value in metrics.items():
                if isinstance(value, (int, float)):
                    total_activity += min(value / 100, 1.0)  # Normalize assuming 100 is good
                    metric_count += 1

        return total_activity / metric_count if metric_count > 0 else 0.0

    def _digital_feature_coverage(self, policies: List[Dict]) -> float:
        """Calculate ratio of policies with digital features implemented."""
        with_features = sum(1 for p in policies if p.get('digitalFeatures'))
        return with_features / len(policies) if policies else 0.0

    def _urgency_score(self, policies: List[Dict]) -> float:
        """Calculate weighted urgency score based on priority distribution."""
        if not policies:
            return 0.0

        total = sum(PRIORITY_VALUES.get(p.get('priority', 'medium'), 0.5) for p in policies)
        return total / len(policies)

    def _priority_progress_alignment(self, policies: List[Dict]) -> float:
        """Measure how well progress aligns with priority (high priority = more progress)."""
        if not policies:
            return 0.0

        alignment_score = 0
        for p in policies:
            priority_val = PRIORITY_VALUES.get(p.get('priority', 'medium'), 0.5)
            progress_val = p.get('progress', 0) / 100
            # Good alignment: high priority with high progress
            alignment_score += 1 - abs(priority_val - progress_val)

        return alignment_score / len(policies)

    def _operational_capacity(self, operational: Dict) -> float:
        """Estimate operational capacity from operational data."""
        if not operational:
            return 0.5  # Default neutral

        # Check tech loaners
        tech = operational.get('techLoaners', {})
        devices = tech.get('devices', [])
        if devices:
            total_devices = sum(d.get('total', 0) for d in devices)
            available = sum(d.get('available', 0) for d in devices)
            if total_devices > 0:
                return available / total_devices

        return 0.5

    def _resource_availability(self, operational: Dict) -> float:
        """Measure resource availability across operational areas."""
        if not operational:
            return 0.5

        scores = []

        # Food pantry
        pantry = operational.get('foodPantry', {})
        if pantry:
            locations = pantry.get('locations', [])
            if locations:
                well_stocked = sum(1 for loc in locations
                                   if loc.get('inventory') in ['well-stocked', 'moderate'])
                scores.append(well_stocked / len(locations))

        return sum(scores) / len(scores) if scores else 0.5

    def _service_coverage(self, policies: List[Dict]) -> float:
        """Measure how well services cover different areas."""
        if not policies:
            return 0.0

        # Count unique digital feature types
        all_features = set()
        for p in policies:
            features = p.get('digitalFeatures', [])
            all_features.update(features)

        # Normalize by expected feature count (assume 50 unique features = full coverage)
        return min(len(all_features) / 50, 1.0)

    def _progress_velocity(self, policies: List[Dict]) -> float:
        """Estimate progress velocity based on current state."""
        if not policies:
            return 0.0

        # Policies in progress indicate active movement
        in_progress = sum(1 for p in policies if p.get('status') == 'in_progress')

        # Weight by their progress level (higher progress = faster presumed velocity)
        velocity_score = 0
        for p in policies:
            if p.get('status') == 'in_progress':
                velocity_score += p.get('progress', 0) / 100

        return velocity_score / len(policies) if policies else 0.0

    def _completion_momentum(self, policies: List[Dict]) -> float:
        """Measure completion momentum (completed / total weighted by recency)."""
        if not policies:
            return 0.0

        completed = sum(1 for p in policies if p.get('status') == 'completed')
        in_progress = sum(1 for p in policies if p.get('status') == 'in_progress')

        # Momentum = completed + partial credit for in-progress
        avg_progress = sum(p.get('progress', 0) for p in policies
                          if p.get('status') == 'in_progress') / (in_progress or 1)

        momentum = (completed + (in_progress * avg_progress / 100)) / len(policies)
        return momentum

    def _initiative_diversity(self, policies: List[Dict]) -> float:
        """Measure diversity of initiatives across departments."""
        dept_counts = self._count_by_department(policies)
        if not policies:
            return 0.0

        # Calculate entropy-like diversity score
        n = len(policies)
        diversity = 0
        for count in dept_counts.values():
            if count > 0:
                p = count / n
                diversity -= p * math.log(p + 1e-10)

        # Normalize by max entropy (uniform distribution)
        max_entropy = math.log(len(DEPARTMENTS))
        return diversity / max_entropy if max_entropy > 0 else 0.0

    def _cross_dept_collaboration(self, policies: List[Dict]) -> float:
        """Estimate cross-department collaboration potential."""
        # Count shared digital feature patterns across departments
        dept_features: Dict[str, set] = {d: set() for d in DEPARTMENTS}

        for p in policies:
            dept = p.get('department', '')
            features = p.get('digitalFeatures', [])
            if dept in dept_features:
                dept_features[dept].update(features)

        # Count feature overlaps between departments
        overlaps = 0
        comparisons = 0
        depts = list(dept_features.keys())

        for i in range(len(depts)):
            for j in range(i + 1, len(depts)):
                set_i = dept_features[depts[i]]
                set_j = dept_features[depts[j]]
                if set_i and set_j:
                    overlap = len(set_i & set_j) / len(set_i | set_j)
                    overlaps += overlap
                    comparisons += 1

        return overlaps / comparisons if comparisons > 0 else 0.0

    def _implementation_depth(self, policies: List[Dict]) -> float:
        """Measure depth of implementation (features per policy)."""
        if not policies:
            return 0.0

        total_features = sum(len(p.get('digitalFeatures', [])) for p in policies)
        avg_features = total_features / len(policies)

        # Normalize assuming 4 features per policy is good depth
        return min(avg_features / 4, 1.0)

    def _stagnation_risk(self, policies: List[Dict], state: PolicyState) -> float:
        """
        Calculate stagnation risk indicator.

        High risk when:
        - Many policies at 0% progress
        - High ratio of planned vs in_progress
        - Low metric activity
        """
        if not policies:
            return 0.5

        risk_factors = []

        # Factor 1: Policies with zero progress
        zero_progress = sum(1 for p in policies if p.get('progress', 0) == 0)
        risk_factors.append(zero_progress / len(policies))

        # Factor 2: Stuck in planning
        planned = sum(1 for p in policies if p.get('status') == 'planned')
        risk_factors.append(planned / len(policies))

        # Factor 3: Low metric activity
        metric_activity = self._avg_metric_activity(policies)
        risk_factors.append(1 - metric_activity)

        # Factor 4: No completed policies
        completed = sum(1 for p in policies if p.get('status') == 'completed')
        risk_factors.append(1 - (completed / len(policies)))

        return sum(risk_factors) / len(risk_factors)

    def _engagement_drop_risk(self, policies: List[Dict], state: PolicyState) -> float:
        """
        Calculate engagement drop risk indicator.

        High risk when:
        - Low students reached
        - Low feedback received
        - Low events
        - Low metric activity
        """
        risk_factors = []
        qs = state.quick_stats

        # Factor 1: Low student reach (expect at least 1000)
        students = qs.get('totalStudentsReached', 0)
        risk_factors.append(1 - min(students / 1000, 1.0))

        # Factor 2: Low feedback (expect at least 50)
        feedback = qs.get('feedbackReceived', 0)
        risk_factors.append(1 - min(feedback / 50, 1.0))

        # Factor 3: Low events (expect at least 5/month)
        events = qs.get('eventsThisMonth', 0)
        risk_factors.append(1 - min(events / 5, 1.0))

        # Factor 4: Low active initiatives
        active = qs.get('activeInitiatives', 0)
        risk_factors.append(1 - min(active / 10, 1.0))

        return sum(risk_factors) / len(risk_factors)

    def _vector_magnitude(self, vec: List[float]) -> float:
        """Calculate L2 magnitude of a vector."""
        return math.sqrt(sum(x * x for x in vec))

    def _latent_balance(self, latent: List[float]) -> float:
        """Measure how balanced the latent representation is."""
        if not latent:
            return 0.0

        # Check variance - balanced = lower variance
        mean = sum(latent) / len(latent)
        variance = sum((x - mean) ** 2 for x in latent) / len(latent)

        # Normalize (lower variance = higher balance score)
        return 1 / (1 + variance)

    def close(self):
        """Close the UFE client connection."""
        self.client.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
