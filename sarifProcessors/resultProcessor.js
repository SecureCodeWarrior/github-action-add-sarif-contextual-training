"use strict";

async function process(run) {
    const ruleMap = new Map();

    if (run && run.results) {
        for (const result of run.results) {
            const ruleId = result.ruleId;
            const seen = ruleMap.get(ruleId);
            if (seen === undefined) {
                ruleMap.set(ruleId, true);
            }
        }
    }

    return ruleMap;
}

module.exports = {
    process
};
