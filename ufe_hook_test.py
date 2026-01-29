#!/usr/bin/env python3
"""
UFE Hook Test - Demonstrates real data flowing through the system.
"""

from ufe_hook import hook
from ufe_integration import UFEIntegration

def main():
    print("=" * 60)
    print("UFE HOOK - REAL DATA FLOW TEST")
    print("=" * 60)

    # Fetch real data
    print("\n[1] Fetching real Project Bold data...")
    states = hook._fetch_real_data()

    print(f"    States collected: {len(states)}")

    # Analyze the current state
    state = states[-1]
    policies = state.policies
    quick_stats = state.quick_stats

    print(f"\n[2] Policy Data Summary:")
    print(f"    Total policies: {len(policies)}")

    # Count by department
    dept_counts = {}
    status_counts = {'planned': 0, 'in_progress': 0, 'completed': 0}
    priority_counts = {'high': 0, 'medium': 0, 'low': 0}

    for p in policies:
        dept = p.get('department', 'unknown')
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        status = p.get('status', 'planned')
        status_counts[status] = status_counts.get(status, 0) + 1
        priority = p.get('priority', 'medium')
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    print("\n    By Department:")
    for dept, count in sorted(dept_counts.items()):
        print(f"      - {dept}: {count}")

    print("\n    By Status:")
    for status, count in status_counts.items():
        print(f"      - {status}: {count}")

    print("\n    By Priority:")
    for priority, count in priority_counts.items():
        print(f"      - {priority}: {count}")

    # Show quick stats
    print(f"\n[3] Quick Stats (Engagement Metrics):")
    for key, value in quick_stats.items():
        print(f"    {key}: {value}")

    # Convert to feature vector
    print(f"\n[4] Converting to 32-dimensional UFE Feature Vector...")
    ufe = UFEIntegration()
    features = ufe.to_features(state)

    print(f"\n    Feature Vector (32 dimensions):")
    print(f"    ┌{'─'*56}┐")

    feature_labels = [
        # Status metrics [0-4]
        ("Overall Progress", features[0]),
        ("Completed Ratio", features[1]),
        ("In-Progress Ratio", features[2]),
        ("Planned Ratio", features[3]),
        ("Active Policy Count", features[4]),
        # Engagement [5-9]
        ("Students Reached (log)", features[5]),
        ("Feedback Received (log)", features[6]),
        ("Events This Month", features[7]),
        ("Avg Metric Activity", features[8]),
        ("Digital Feature Coverage", features[9]),
        # Departments [10-14]
        ("Wellness Dept Ratio", features[10]),
        ("Basic-Needs Ratio", features[11]),
        ("Academic Ratio", features[12]),
        ("Communications Ratio", features[13]),
        ("Environmental Ratio", features[14]),
        # Priority [15-19]
        ("High Priority Ratio", features[15]),
        ("Medium Priority Ratio", features[16]),
        ("Low Priority Ratio", features[17]),
        ("Urgency Score", features[18]),
        ("Priority-Progress Align", features[19]),
        # Operational [20-24]
        ("Budget Utilization", features[20]),
        ("Budget Allocation", features[21]),
        ("Operational Capacity", features[22]),
        ("Resource Availability", features[23]),
        ("Service Coverage", features[24]),
        # Momentum [25-29]
        ("Progress Velocity", features[25]),
        ("Completion Momentum", features[26]),
        ("Initiative Diversity", features[27]),
        ("Cross-Dept Collab", features[28]),
        ("Implementation Depth", features[29]),
        # Friction [30-31]
        ("STAGNATION RISK", features[30]),
        ("ENGAGEMENT DROP", features[31]),
    ]

    for i, (label, value) in enumerate(feature_labels):
        bar_len = int(value * 20)
        bar = "█" * bar_len + "░" * (20 - bar_len)
        if i >= 30:  # Friction terms - highlight
            print(f"    │ [{i:2d}] {label:22s} │{bar}│ {value:.4f} │")
        else:
            print(f"    │ [{i:2d}] {label:22s} │{bar}│ {value:.4f} │")
    print(f"    └{'─'*56}┘")

    # Interpretation
    print(f"\n[5] GOVERNANCE INTERPRETATION:")
    print(f"    ┌{'─'*50}┐")

    stag_risk = features[30]
    eng_drop = features[31]

    if stag_risk > 0.7:
        print(f"    │ ⚠️  HIGH STAGNATION RISK ({stag_risk:.2f})             │")
        print(f"    │    Most policies stuck in planning phase      │")
    elif stag_risk > 0.4:
        print(f"    │ ⚡ MODERATE STAGNATION RISK ({stag_risk:.2f})          │")
        print(f"    │    Some policies need progress acceleration   │")
    else:
        print(f"    │ ✓  LOW STAGNATION RISK ({stag_risk:.2f})               │")
        print(f"    │    Policies progressing well                  │")

    if eng_drop > 0.7:
        print(f"    │ ⚠️  HIGH ENGAGEMENT DROP RISK ({eng_drop:.2f})         │")
        print(f"    │    Student participation critically low       │")
    elif eng_drop > 0.4:
        print(f"    │ ⚡ MODERATE ENGAGEMENT RISK ({eng_drop:.2f})           │")
        print(f"    │    Need more outreach and events              │")
    else:
        print(f"    │ ✓  LOW ENGAGEMENT DROP RISK ({eng_drop:.2f})           │")
        print(f"    │    Engagement metrics healthy                 │")

    print(f"    └{'─'*50}┘")

    # Summary
    print(f"\n[6] REAL DATA FLOW SUMMARY:")
    print(f"    ✓ Fetched {len(policies)} real policies from Project Bold")
    print(f"    ✓ Converted to 32-dimensional governance feature vector")
    print(f"    ✓ Computed friction terms: stagnation_risk, engagement_drop")
    print(f"    ✓ Ready for UFE energy landscape analysis")
    print(f"\n    The hook will sync this data to UFE every {hook.interval}s")
    print(f"    Start with: from ufe_hook import hook; hook.start()")


if __name__ == "__main__":
    main()
