#!/usr/bin/env python3
"""
UFE Demo for Project Bold - Governance Policy Modeling

Demonstrates the Undercurrent Flux Engine integration with real
policy data from the Project Bold platform.

This demo:
1. Connects to the UFE API and verifies health
2. Loads real policy data from Project Bold
3. Converts policies to 32-dimensional feature vectors
4. Analyzes energy landscape, friction terms, and predictions
5. Provides interpretive insights on governance dynamics
"""

from datetime import datetime
from typing import Any, Dict, List

from ufe_integration import UFEIntegration, PolicyState


# Real policy data from Project Bold (lib/data.js)
# This represents the actual 27 policies across 5 departments
INITIAL_POLICIES = [
    # STUDENT WELLNESS (6 policies)
    {'id': 'caps-expansion', 'department': 'wellness', 'title': 'Expand CAPS Access Through Drop-In Hours and More Locations', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['drop-in-scheduler', 'location-finder', 'virtual-counseling', 'connectcarolina-integration'], 'metrics': {'dropInHours': 0, 'locations': 0, 'virtualSessions': 0}},
    {'id': 'safety-taskforce', 'department': 'wellness', 'title': 'Launch Off-Campus Safety Task Force and Ride Programs', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['ride-request', 'real-time-tracking', 'safety-reporting', 'volunteer-portal'], 'metrics': {'rides': 0, 'volunteers': 0, 'safetyReports': 0}},
    {'id': 'planb-narcan', 'department': 'wellness', 'title': 'Increase Access to Plan B and Narcan Distribution', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['location-map', 'availability-tracker', 'education-portal', 'restock-alerts'], 'metrics': {'locations': 0, 'distributed': 0, 'trainings': 0}},
    {'id': 'event-safety', 'department': 'wellness', 'title': 'Implement Off-Campus Event Safety Planning', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['plan-submission', 'template-library', 'workshop-registration', 'approval-tracker'], 'metrics': {'plansSubmitted': 0, 'workshops': 0, 'orgsCompliant': 0}},
    {'id': 'wellness-button', 'department': 'wellness', 'title': 'Add a "Student Wellness" Button in Canvas', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['canvas-integration', 'resource-directory', 'quick-access', 'crisis-hotline'], 'metrics': {'clicks': 0, 'resourceViews': 0, 'satisfaction': 0}},
    {'id': 'health-integration', 'department': 'wellness', 'title': 'Integrate Campus Health Services into ConnectCarolina', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['unified-scheduling', 'health-records', 'appointment-reminders', 'care-coordination'], 'metrics': {'appointments': 0, 'integrationComplete': 0, 'satisfaction': 0}},

    # BASIC NEEDS (5 policies)
    {'id': 'farmers-markets', 'department': 'basic-needs', 'title': 'Expand On-Campus Farmers Markets and Chase Farm Stands', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['market-schedule', 'vendor-directory', 'location-map', 'produce-availability'], 'metrics': {'markets': 0, 'vendors': 0, 'students': 0}},
    {'id': 'food-security-hub', 'department': 'basic-needs', 'title': 'Centralize Food Security Access', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['resource-map', 'meal-swipe-sharing', 'pantry-locator', 'crisis-support'], 'metrics': {'resourcesListed': 0, 'swipesShared': 0, 'studentsHelped': 0}},
    {'id': 'plus-swipe-expansion', 'department': 'basic-needs', 'title': 'Expand Plus Swipe Options', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['vendor-list', 'nutrition-info', 'location-finder', 'feedback-system'], 'metrics': {'vendors': 0, 'transactions': 0, 'satisfaction': 0}},
    {'id': 'grocery-shuttle', 'department': 'basic-needs', 'title': 'Create Student Grocery Transportation Access', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['shuttle-schedule', 'route-map', 'reservation-system', 'real-time-tracking'], 'metrics': {'routes': 0, 'rides': 0, 'stores': 0}},
    {'id': 'offcampus-education', 'department': 'basic-needs', 'title': 'Launch Off-Campus Living Education', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['workshop-calendar', 'resource-library', 'coach-directory', 'budgeting-tools'], 'metrics': {'workshops': 0, 'attendees': 0, 'coachesTrained': 0}},

    # ACADEMIC AFFAIRS (5 policies)
    {'id': 'peer-mentorship', 'department': 'academic', 'title': 'Establish University-Wide Peer Mentorship Network', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['mentor-matching', 'appointment-booking', 'subject-directory', 'feedback-system'], 'metrics': {'mentors': 0, 'sessions': 0, 'subjects': 0}},
    {'id': 'midterm-checkins', 'department': 'academic', 'title': 'Introduce Standardized Midterm Progress Check-Ins', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['progress-portal', 'advisor-alerts', 'resource-recommendations', 'grade-projections'], 'metrics': {'checkIns': 0, 'studentsReached': 0, 'interventions': 0}},
    {'id': 'stem-centers', 'department': 'academic', 'title': 'STEM Collaboration and Study Centers', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['space-reservation', 'tutor-schedule', 'resource-library', 'group-finder'], 'metrics': {'centers': 0, 'visits': 0, 'studyGroups': 0}},
    {'id': 'deans-list', 'department': 'academic', 'title': "Enhance and Expedite the Dean's List Process", 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['notification-system', 'digital-certificates', 'linkedin-integration', 'recognition-portal'], 'metrics': {'recognized': 0, 'notificationTime': 0, 'satisfaction': 0}},
    {'id': 'strengths-integration', 'department': 'academic', 'title': 'First-Year Strengths Integration', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['assessment-portal', 'results-dashboard', 'pathway-recommendations', 'advisor-integration'], 'metrics': {'assessments': 0, 'studentsMatched': 0, 'satisfaction': 0}},

    # COMMUNICATIONS (6 policies)
    {'id': 'who-is-carolina', 'department': 'communications', 'title': 'Launch "Who is Carolina" Storytelling Campaign', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['submission-portal', 'video-gallery', 'social-integration', 'nomination-system'], 'metrics': {'stories': 0, 'views': 0, 'nominations': 0}},
    {'id': 'vc-advisory', 'department': 'communications', 'title': 'Create Student Advisory Committee to Vice Chancellor', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['application-portal', 'meeting-scheduler', 'feedback-tracker', 'recommendation-log'], 'metrics': {'members': 0, 'meetings': 0, 'recommendations': 0}},
    {'id': 'sg-podcast', 'department': 'communications', 'title': 'Produce a Student Government Podcast', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['episode-archive', 'guest-nominations', 'subscription-manager', 'transcript-library'], 'metrics': {'episodes': 0, 'listeners': 0, 'guests': 0}},
    {'id': 'talent-spotlight', 'department': 'communications', 'title': 'Showcase Student Talent through Social Media', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['submission-form', 'content-calendar', 'artist-directory', 'event-promotion'], 'metrics': {'spotlights': 0, 'engagement': 0, 'artists': 0}},
    {'id': 'student-success', 'department': 'communications', 'title': 'Celebrate Student Success and Everyday Life', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['content-submission', 'story-highlights', 'achievement-tracker', 'community-feed'], 'metrics': {'posts': 0, 'engagement': 0, 'submissions': 0}},
    {'id': 'accountability-campaign', 'department': 'communications', 'title': 'Lead an Assessment & Accountability Campaign', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['progress-dashboard', 'benchmark-tracker', 'public-reports', 'feedback-system'], 'metrics': {'projects': 0, 'benchmarksMet': 0, 'reportsPublished': 0}},

    # ENVIRONMENTAL (5 policies)
    {'id': 'sustain-carolina-week', 'department': 'environmental', 'title': 'Launch Sustain Carolina Week', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['event-calendar', 'challenge-tracker', 'partner-directory', 'impact-dashboard'], 'metrics': {'events': 0, 'participants': 0, 'partners': 0}},
    {'id': 'too-good-to-go', 'department': 'environmental', 'title': 'Pilot "Too Good To Go" Dining Model', 'status': 'planned', 'priority': 'high', 'progress': 0, 'digitalFeatures': ['meal-availability', 'pickup-scheduler', 'waste-tracker', 'notification-system'], 'metrics': {'mealsRedistributed': 0, 'wasteReduced': 0, 'studentsServed': 0}},
    {'id': 'adopt-a-space', 'department': 'environmental', 'title': 'Adopt-a-Space & Campus Trash Pickup Day', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['space-registry', 'cleanup-scheduler', 'hours-tracker', 'leaderboard'], 'metrics': {'spacesAdopted': 0, 'cleanupEvents': 0, 'volunteers': 0}},
    {'id': 'composting-expansion', 'department': 'environmental', 'title': 'Expand Composting and Plate-Clearing Stations', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['location-map', 'waste-metrics', 'education-portal', 'ambassador-signup'], 'metrics': {'stations': 0, 'wasteDiverted': 0, 'ambassadors': 0}},
    {'id': 'moveout-shop', 'department': 'environmental', 'title': 'Establish a Move-Out Donation Shop', 'status': 'planned', 'priority': 'medium', 'progress': 0, 'digitalFeatures': ['donation-scheduler', 'inventory-browser', 'pickup-request', 'impact-tracker'], 'metrics': {'itemsCollected': 0, 'itemsSold': 0, 'donated': 0}},
]

# Simulated quick stats (would come from database in production)
INITIAL_QUICK_STATS = {
    'totalStudentsReached': 0,
    'activeInitiatives': 0,
    'eventsThisMonth': 0,
    'feedbackReceived': 0
}

# Simulated budget data
INITIAL_BUDGET = {
    'total': 50000,
    'allocated': 0,
    'spent': 0
}


def create_scenario_states() -> List[PolicyState]:
    """
    Create a sequence of policy states representing platform evolution.

    Simulates the platform's progression from initial launch through
    active implementation over several time periods.
    """
    states = []

    # State 1: Initial launch - all policies planned, no activity
    state1 = PolicyState(
        policies=INITIAL_POLICIES.copy(),
        quick_stats=INITIAL_QUICK_STATS.copy(),
        budget=INITIAL_BUDGET.copy(),
        timestamp=datetime(2026, 1, 1)
    )
    states.append(state1)

    # State 2: Early momentum - some policies started, initial engagement
    policies_t2 = []
    for p in INITIAL_POLICIES:
        p_copy = p.copy()
        p_copy['metrics'] = p['metrics'].copy()
        # Start high priority wellness and basic needs policies
        if p['priority'] == 'high' and p['department'] in ['wellness', 'basic-needs']:
            p_copy['status'] = 'in_progress'
            p_copy['progress'] = 15
        policies_t2.append(p_copy)

    state2 = PolicyState(
        policies=policies_t2,
        quick_stats={
            'totalStudentsReached': 250,
            'activeInitiatives': 6,
            'eventsThisMonth': 3,
            'feedbackReceived': 12
        },
        budget={'total': 50000, 'allocated': 15000, 'spent': 3500},
        timestamp=datetime(2026, 2, 1)
    )
    states.append(state2)

    # State 3: Building traction - more policies active, growing engagement
    policies_t3 = []
    for p in policies_t2:
        p_copy = p.copy()
        p_copy['metrics'] = p['metrics'].copy()
        if p_copy['status'] == 'in_progress':
            p_copy['progress'] = min(p_copy['progress'] + 25, 100)
        elif p_copy['priority'] == 'high':
            p_copy['status'] = 'in_progress'
            p_copy['progress'] = 10
        policies_t3.append(p_copy)

    state3 = PolicyState(
        policies=policies_t3,
        quick_stats={
            'totalStudentsReached': 850,
            'activeInitiatives': 12,
            'eventsThisMonth': 8,
            'feedbackReceived': 45
        },
        budget={'total': 50000, 'allocated': 32000, 'spent': 12000},
        timestamp=datetime(2026, 3, 1)
    )
    states.append(state3)

    # State 4: Full momentum - first completions, strong engagement
    policies_t4 = []
    for p in policies_t3:
        p_copy = p.copy()
        p_copy['metrics'] = p['metrics'].copy()
        if p_copy['progress'] >= 40:
            p_copy['progress'] = min(p_copy['progress'] + 35, 100)
            if p_copy['progress'] >= 100:
                p_copy['status'] = 'completed'
        elif p_copy['status'] == 'in_progress':
            p_copy['progress'] = min(p_copy['progress'] + 20, 100)
        elif p_copy['priority'] in ['high', 'medium']:
            p_copy['status'] = 'in_progress'
            p_copy['progress'] = 5
        policies_t4.append(p_copy)

    state4 = PolicyState(
        policies=policies_t4,
        quick_stats={
            'totalStudentsReached': 2100,
            'activeInitiatives': 18,
            'eventsThisMonth': 15,
            'feedbackReceived': 120
        },
        budget={'total': 50000, 'allocated': 45000, 'spent': 28000},
        timestamp=datetime(2026, 4, 1)
    )
    states.append(state4)

    # State 5: Mature platform - many completions, sustained engagement
    policies_t5 = []
    for p in policies_t4:
        p_copy = p.copy()
        p_copy['metrics'] = p['metrics'].copy()
        if p_copy['status'] == 'completed':
            pass  # Already done
        elif p_copy['progress'] >= 50:
            p_copy['progress'] = 100
            p_copy['status'] = 'completed'
        elif p_copy['status'] == 'in_progress':
            p_copy['progress'] = min(p_copy['progress'] + 30, 100)
        else:
            p_copy['status'] = 'in_progress'
            p_copy['progress'] = 15
        policies_t5.append(p_copy)

    state5 = PolicyState(
        policies=policies_t5,
        quick_stats={
            'totalStudentsReached': 4500,
            'activeInitiatives': 22,
            'eventsThisMonth': 20,
            'feedbackReceived': 250
        },
        budget={'total': 50000, 'allocated': 50000, 'spent': 42000},
        timestamp=datetime(2026, 5, 1)
    )
    states.append(state5)

    return states


def print_section(title: str, char: str = "="):
    """Print a formatted section header."""
    print(f"\n{char * 60}")
    print(f"{title}")
    print(f"{char * 60}")


def format_friction_indicator(value: float) -> str:
    """Format a friction value with visual indicator."""
    if value < 0.3:
        return f"{value:.4f} [LOW]"
    elif value < 0.6:
        return f"{value:.4f} [MODERATE]"
    else:
        return f"{value:.4f} [HIGH]"


def main():
    """Run the UFE integration demo with real Project Bold data."""
    print_section("UFE INTEGRATION DEMO - PROJECT BOLD GOVERNANCE")
    print("Undercurrent Flux Engine for Policy Modeling")
    print("Domain: governance | Features: 32 | Latent: 256")

    # Initialize integration
    with UFEIntegration() as ufe:

        # 1. Test API connection
        print_section("1. UFE API CONNECTION TEST")
        try:
            health = ufe.client.health()
            print(f"Status: {health.get('status', 'unknown')}")
            print(f"Latent Dimensions: {health.get('latent_dim', 'unknown')}")
            print(f"Available Domains: {health.get('domains', [])}")

            if health.get('status') != 'healthy':
                print("\nWARNING: API not healthy, results may be affected")
        except Exception as e:
            print(f"ERROR: Could not connect to UFE API: {e}")
            print("Continuing with feature vector demonstration...")

        # 2. Load and display policy data
        print_section("2. PROJECT BOLD POLICY DATA")
        print(f"Total Policies: {len(INITIAL_POLICIES)}")

        dept_counts: Dict[str, int] = {}
        priority_counts: Dict[str, int] = {}
        for p in INITIAL_POLICIES:
            dept = p['department']
            dept_counts[dept] = dept_counts.get(dept, 0) + 1
            priority = p['priority']
            priority_counts[priority] = priority_counts.get(priority, 0) + 1

        print("\nBy Department:")
        for dept, count in sorted(dept_counts.items()):
            print(f"  - {dept}: {count} policies")

        print("\nBy Priority:")
        for priority in ['high', 'medium', 'low']:
            count = priority_counts.get(priority, 0)
            print(f"  - {priority}: {count} policies")

        # 3. Create scenario states
        print_section("3. POLICY STATE TRAJECTORY")
        states = create_scenario_states()
        print(f"Simulating {len(states)} time periods of platform evolution")

        for i, state in enumerate(states):
            completed = sum(1 for p in state.policies if p['status'] == 'completed')
            in_progress = sum(1 for p in state.policies if p['status'] == 'in_progress')
            planned = sum(1 for p in state.policies if p['status'] == 'planned')
            avg_progress = sum(p['progress'] for p in state.policies) / len(state.policies)

            print(f"\n  T{i+1} ({state.timestamp.strftime('%Y-%m')})")
            print(f"      Status: {completed} completed, {in_progress} in progress, {planned} planned")
            print(f"      Avg Progress: {avg_progress:.1f}%")
            print(f"      Students Reached: {state.quick_stats['totalStudentsReached']}")

        # 4. Convert to feature vectors
        print_section("4. FEATURE VECTOR CONVERSION")
        print("Converting policy states to 32-dimensional UFE features...")

        for i, state in enumerate(states):
            features = ufe.to_features(state)
            print(f"\n  T{i+1} Feature Summary:")
            print(f"      [0-4]   Status:      {features[0]:.3f}, {features[1]:.3f}, {features[2]:.3f}")
            print(f"      [5-9]   Engagement:  {features[5]:.3f}, {features[6]:.3f}, {features[7]:.3f}")
            print(f"      [15-19] Priority:    {features[15]:.3f}, {features[16]:.3f}, {features[17]:.3f}")
            print(f"      [30-31] Friction:    stag={features[30]:.3f}, eng={features[31]:.3f}")

        # 5. Analyze through UFE API
        print_section("5. UFE ENERGY ANALYSIS")
        print(f"Analyzing {len(states)}-step trajectory through UFE...")

        try:
            result = ufe.analyze(states)

            energy = result.get('energy', {})
            print(f"\nTotal Energy: {energy.get('total_energy', 0):.4f}")
            print(f"  - Trajectory Deviation: {energy.get('trajectory_deviation', 0):.4f}")
            print(f"  - Undercurrent Friction: {energy.get('undercurrent_friction', 0):.4f}")
            print(f"  - Self-Prediction Error: {energy.get('self_prediction_error', 0):.4f}")

            print(f"\nFriction Breakdown:")
            friction = result.get('friction', {})
            for term, value in friction.items():
                if term != 'total':
                    print(f"  - {term}: {format_friction_indicator(value)}")

            print(f"\nLatent Shape: {result.get('latent_shape', [])}")
            print(f"Prediction Shape: {result.get('prediction_shape', [])}")

            # 6. Interpretation
            print_section("6. GOVERNANCE INTERPRETATION")

            total_energy = energy.get('total_energy', 0)
            stag_risk = friction.get('stagnation_risk', 0)
            eng_drop = friction.get('engagement_drop', 0)

            if total_energy < 0.4:
                print("STABLE STATE - System is in a low-energy configuration")
                print("  Policies are progressing smoothly with minimal friction")
            elif total_energy < 0.7:
                print("TRANSITIONING - System is actively evolving")
                print("  Moderate energy indicates dynamic policy implementation")
            else:
                print("UNSTABLE - System shows high energy, expect changes")
                print("  High friction may indicate implementation challenges")

            print("\nRisk Assessment:")
            if stag_risk > 0.6:
                print("  [!] HIGH STAGNATION RISK - Many policies lack progress")
                print("      Recommendation: Focus resources on stuck initiatives")
            elif stag_risk > 0.3:
                print("  [~] MODERATE STAGNATION RISK - Some policies need attention")
            else:
                print("  [OK] LOW STAGNATION RISK - Healthy policy momentum")

            if eng_drop > 0.6:
                print("  [!] HIGH ENGAGEMENT DROP RISK - Student participation declining")
                print("      Recommendation: Increase outreach and events")
            elif eng_drop > 0.3:
                print("  [~] MODERATE ENGAGEMENT RISK - Monitor participation metrics")
            else:
                print("  [OK] STRONG ENGAGEMENT - Student involvement is healthy")

        except Exception as e:
            print(f"\nAPI Error: {e}")
            print("\nFalling back to local feature analysis...")

            # Show local analysis even without API
            last_state = states[-1]
            features = ufe.to_features(last_state)
            print(f"\nFinal State Features (T{len(states)}):")
            print(f"  Overall Progress: {features[0]*100:.1f}%")
            print(f"  Completion Rate: {features[1]*100:.1f}%")
            print(f"  Stagnation Risk: {format_friction_indicator(features[30])}")
            print(f"  Engagement Drop: {format_friction_indicator(features[31])}")

        # 7. Summary
        print_section("7. DEMO SUMMARY")
        print("Project Bold UFE Integration Complete")
        print(f"  - Analyzed: {len(INITIAL_POLICIES)} policies across 5 departments")
        print(f"  - Trajectory: {len(states)} time periods")
        print(f"  - Features: 32-dimensional governance vectors")
        print(f"  - Domain: governance")
        print("\nThe UFE integration enables:")
        print("  1. Policy health monitoring via energy landscapes")
        print("  2. Early warning through friction term detection")
        print("  3. Trajectory prediction for planning")
        print("  4. Cross-department dynamics analysis")


if __name__ == "__main__":
    main()
