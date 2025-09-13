// Function to extract essential data from axe-core results

export const extractEssentialData = (axeResults) => {
    // Extract summary statistics
    const summary = {
        totalViolations: axeResults.violations.length,
        criticalCount: axeResults.violations.filter(v => v.impact === 'critical').length,
        seriousCount: axeResults.violations.filter(v => v.impact === 'serious').length,
        moderateCount: axeResults.violations.filter(v => v.impact === 'moderate').length,
        minorCount: axeResults.violations.filter(v => v.impact === 'minor').length
    };

    // Extract essential violation information
    const essentialViolations = axeResults.violations.map(violation => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        tags: violation.tags,
        nodeCount: violation.nodes.length,
        
        // Extract affected elements (limit to essential info)
        affectedElements: violation.nodes.map(node => ({
            target: node.target,
            html: node.html.length > 200 ? node.html.substring(0, 200) + '...' : node.html,
            failureSummary: node.failureSummary,
            
            // Specific rule failures
            anyFailures: node.any.map(check => ({
                id: check.id,
                message: check.message,
                data: check.data
            })),
            
            allFailures: node.all.map(check => ({
                id: check.id,
                message: check.message,
                data: check.data
            }))
        }))
    }));

    // Sort violations by priority (critical first)
    const prioritizedViolations = essentialViolations.sort((a, b) => {
        const impactOrder = { critical: 4, serious: 3, moderate: 2, minor: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
    });

    // Create violations by type for pattern analysis
    const violationsByType = {};
    axeResults.violations.forEach(violation => {
        if (!violationsByType[violation.id]) {
            violationsByType[violation.id] = {
                type: violation.id,
                description: violation.description,
                impact: violation.impact,
                count: 0,
                helpUrl: violation.helpUrl
            };
        }
        violationsByType[violation.id].count += violation.nodes.length;
    });

    // Get top issues (most frequent)
    const topIssues = Object.values(violationsByType)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Extract only critical and serious violations for immediate action
    const urgentViolations = essentialViolations.filter(v => 
        v.impact === 'critical' || v.impact === 'serious'
    );

    // Create actionable items list
    const actionableItems = prioritizedViolations.map(violation => ({
        priority: violation.impact,
        issue: violation.description,
        solution: violation.help,
        elementsAffected: violation.nodeCount,
        ruleId: violation.id,
        helpUrl: violation.helpUrl
    }));

    return {
        summary,
        prioritizedViolations,
        violationsByType: Object.values(violationsByType),
        topIssues,
        urgentViolations,
        actionableItems
    };
};
