import * as fcl from "@onflow/fcl";
import { splitArgs } from "@onflow/flow-cadut";

const template = `{
    "f_type": "InteractionTemplate",
    "f_version": "1.0.0",
    "id": "",
    "data": {
      "type": "",
      "interface": "",
      "messages": {},
      "cadence": "",
      "dependencies": {},
      "arguments": {}
    }   
}`;
const messageDefault = {
    title: {
        i18n: {
            "en-US": "",
        },
    },
    description: {
        i18n: {
            "en-US": "",
        },
    },
};

const genTemplate = () => JSON.parse(template);

export async function generateTemplate(
    type,
    cadence,
    dependencies,
    argumentKeys
) {
    let args = {};
    argumentKeys.forEach((argKey, argKeyIndex) => {
        args[splitArgs(argKey)[0]] = {
            index: argKeyIndex,
            type: splitArgs(argKey)[1],
            messages: messageDefault,
            balance: "",
        };
    });

    let deps = {};
    Object.keys(dependencies).forEach((dep) => {
        deps[dependencies[dep]] = { [dep]: {} };
    });

    let template = genTemplate();
    template.data.type = type;
    template.data.interface = "";
    template.data.messages = messageDefault;
    template.data.cadence = cadence;
    template.data.dependencies = deps;
    template.data.arguments = args;
    template.id = await fcl.InteractionTemplateUtils.generateTemplateId({
        template,
    });
    return template;
}
