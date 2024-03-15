import { ChatCommand, ICommandsProvider } from './ICommandsProvider';

import { CommandsAlter } from './CommandsAlter';
import { CommandsBeam } from './CommandsBeam';
import { CommandsBrowse } from './CommandsBrowse';
import { CommandsDraw } from './CommandsDraw';
import { CommandsHelp } from './CommandsHelp';
import { CommandsReact } from './CommandsReact';


export type CommandsProviderId = 'ass-browse' | 'ass-t2i' | 'ass-react' | 'chat-alter' | 'cmd-help' | 'mode-beam';

type TextCommandPiece =
  | { type: 'text'; value: string; }
  | { type: 'cmd'; providerId: CommandsProviderId, command: string; params?: string, isError?: boolean };


const ChatCommandsProviders: Record<CommandsProviderId, ICommandsProvider> = {
  'ass-browse': CommandsBrowse,
  'ass-react': CommandsReact,
  'ass-t2i': CommandsDraw,
  'chat-alter': CommandsAlter,
  'cmd-help': CommandsHelp,
  'mode-beam': CommandsBeam,
};

export function findAllChatCommands(): ChatCommand[] {
  return Object.values(ChatCommandsProviders)
    .sort((a, b) => a.rank - b.rank)
    .map(p => p.getCommands())
    .flat();
}

export function extractChatCommand(input: string): TextCommandPiece[] {
  const inputTrimmed = input.trim();

  // quick exit: command does not start with '/'
  if (!inputTrimmed.startsWith('/'))
    return [{ type: 'text', value: input }];

  // Split the input on the first occurrence of whitespace
  const [potentialCommand, ...paramsArray] = inputTrimmed.split(/\s+/, 2);

  // Check if the potential command is an actual command
  for (const provider of Object.values(ChatCommandsProviders)) {
    for (const cmd of provider.getCommands()) {
      if (cmd.primary === potentialCommand || cmd.alternatives?.includes(potentialCommand)) {

        // command needs arguments: take the rest of the input as parameters
        if (cmd.arguments?.length) {
          const params = paramsArray.length > 0 ? paramsArray.join(' ') : '';
          return [{ type: 'cmd', providerId: provider.id, command: potentialCommand, params: params || undefined, isError: !params || undefined }];
        }

        // command without arguments, treat any text after as a separate text piece
        const pieces: TextCommandPiece[] = [{ type: 'cmd', providerId: provider.id, command: potentialCommand, params: undefined }];
        if (paramsArray.length > 0) {
          const textAfterCommand = paramsArray.join(' ');
          if (textAfterCommand)
            pieces.push({ type: 'text', value: textAfterCommand });
        }
        return pieces;
      }
    }
  }

  // No command found, return the entire input as text
  return [{ type: 'text', value: input }];
}
