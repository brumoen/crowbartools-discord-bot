import { ApplicationCommandType, ContextMenuCommandBuilder } from 'discord.js';
import { CommandType, ICommandHandler } from '../command-handler.interface';
import {
    buildIssueModal,
    IssueModalType,
} from '../../../helpers/issue-modal-factory';
import { limitString } from '../../../util/strings';

const config = new ContextMenuCommandBuilder()
    .setName('Submit as Feature')
    .setType(ApplicationCommandType.Message);

export const submitFeatureContextMenuCommand: ICommandHandler = {
    type: CommandType.MessageContextMenuCommand,
    config,
    async onTrigger(interaction) {
        const message = interaction.options.getMessage('message');

        const issueTitle = limitString(message.content, 97, '...');
        const issueDescription = message.content;

        if (issueTitle.length < 5 || issueDescription.length < 5) {
            await interaction.reply({
                content:
                    'This message is too short to submit as a feature request.',
                ephemeral: true,
            });
            return;
        }

        const issueModal = await buildIssueModal({
            type: IssueModalType.SubmitFeature,
            issueTitle,
            issueDescription,
            originalMessage: message,
        });

        await interaction.showModal(issueModal);
    },
};
