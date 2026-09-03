"use strict";

function resolveToolComponent(run, reference) {
    const tool = run.tool;
    if (!tool || !tool.driver) {
        return undefined;
    }
    if (!reference) {
        return tool.driver;
    }
    if (Number.isInteger(reference.index)) {
        return reference.index === -1 ? tool.driver : tool.extensions && tool.extensions[reference.index];
    }
    if (reference.guid) {
        if (tool.driver.guid === reference.guid) {
            return tool.driver;
        }
        return tool.extensions && tool.extensions.find((extension) => extension.guid === reference.guid);
    }
    if (reference.name) {
        if (tool.driver.name === reference.name) {
            return tool.driver;
        }
        return tool.extensions && tool.extensions.find((extension) => extension.name === reference.name);
    }

    return tool.driver;
}

function findRule(component, reference) {
    const rules = component && component.rules;
    if (!rules) {
        return undefined;
    }
    if (Number.isInteger(reference.index)) {
        const indexedRule = rules[reference.index];
        const matchesId = !reference.id || indexedRule && indexedRule.id === reference.id;
        const matchesGuid = !reference.guid || indexedRule && indexedRule.guid === reference.guid;
        if (indexedRule && matchesId && matchesGuid) {
            return indexedRule;
        }
    }
    if (reference.guid) {
        return rules.find((rule) => rule.guid === reference.guid);
    }
    if (reference.id) {
        return rules.find((rule) => rule.id === reference.id);
    }

    return undefined;
}

function resolveRule(run, result) {
    if (result.rule) {
        const component = resolveToolComponent(run, result.rule.toolComponent);
        const rule = findRule(component, result.rule);
        if (rule || result.rule.toolComponent) {
            return rule;
        }
    }

    const tool = run.tool;
    if (!tool || !tool.driver) {
        return undefined;
    }
    if (result.ruleId) {
        const driverRule = (tool.driver.rules || []).find((rule) => rule.id === result.ruleId);
        if (driverRule) {
            return driverRule;
        }

        const extensionRules = (tool.extensions || [])
            .flatMap((extension) => extension.rules || [])
            .filter((rule) => rule.id === result.ruleId);
        return extensionRules.length === 1 ? extensionRules[0] : undefined;
    }
    if (Number.isInteger(result.ruleIndex)) {
        return tool.driver.rules && tool.driver.rules[result.ruleIndex];
    }

    return undefined;
}

async function process(run) {
    const triggeredRules = new Set();

    if (run && run.results) {
        for (const result of run.results) {
            const rule = resolveRule(run, result);
            if (rule) {
                triggeredRules.add(rule);
            }
        }
    }

    return triggeredRules;
}

module.exports = {
    process
};
