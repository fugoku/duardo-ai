import { LLM_IF_OAI_Chat, LLM_IF_OAI_Complete, LLM_IF_OAI_Fn, LLM_IF_OAI_Vision } from '../../store-llms';

import type { ModelDescriptionSchema } from '../llm.server.types';
import { wireGroqModelsListOutputSchema } from './groq.wiretypes';
import { wireMistralModelsListOutputSchema } from './mistral.wiretypes';
import { wireOpenrouterModelsListOutputSchema } from './openrouter.wiretypes';
import { wireTogetherAIListOutputSchema } from './togetherai.wiretypes';

// [Azure] / [OpenAI]
const _knownOpenAIChatModels: ManualMappings = [

  // Fallback - unknown
  {
    idPrefix: '',
    label: '?:',
    description: 'Unknown, please let us know the ID. Assuming a 4097 context window size and Chat capabilities.',
    contextWindow: 4097,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
] as const;

export function azureModelToModelDescription(azureDeploymentRef: string, openAIModelIdBase: string, modelCreated: number, modelUpdated?: number): ModelDescriptionSchema {
  // if the deployment name mataches an OpenAI model prefix, use that
  const known = _knownOpenAIChatModels.find(base => azureDeploymentRef == base.idPrefix);
  return fromManualMapping(_knownOpenAIChatModels, known ? azureDeploymentRef : openAIModelIdBase, modelCreated, modelUpdated);
}

export function openAIModelToModelDescription(modelId: string, modelCreated: number, modelUpdated?: number): ModelDescriptionSchema {
  return fromManualMapping(_knownOpenAIChatModels, modelId, modelCreated, modelUpdated);
}


// [LM Studio]
export function lmStudioModelToModelDescription(modelId: string): ModelDescriptionSchema {

  // LM Studio model ID's are the file names of the model files
  function getFileName(filePath: string): string {
    const normalizedPath = filePath.replace(/\\/g, '/');
    return normalizedPath.split('/').pop() || '';
  }

  return fromManualMapping([], modelId, undefined, undefined, {
    idPrefix: modelId,
    label: getFileName(modelId)
      .replace('.gguf', '')
      .replace('.bin', ''),
    // .replaceAll('-', ' '),
    description: `Unknown LM Studio model. File: ${modelId}`,
    contextWindow: null, // 'not provided'
    interfaces: [LLM_IF_OAI_Chat], // assume..
  });
}


// [LocalAI]
const _knownLocalAIChatModels: ManualMappings = [
  // {
  //   idPrefix: 'ggml-gpt4all-j',
  //   label: 'GPT4All-J',
  //   description: 'GPT4All-J on LocalAI',
  //   contextWindow: 2048,
  //   interfaces: [LLM_IF_OAI_Chat],
  // },
  // {
  //   idPrefix: 'luna-ai-llama2',
  //   label: 'Luna AI Llama2 Uncensored',
  //   description: 'Luna AI Llama2 on LocalAI',
  //   contextWindow: 4096,
  //   interfaces: [LLM_IF_OAI_Chat],
  // },
];

export function localAIModelToModelDescription(modelId: string): ModelDescriptionSchema {
  return fromManualMapping(_knownLocalAIChatModels, modelId, undefined, undefined, {
    idPrefix: modelId,
    label: modelId
      .replace('ggml-', '')
      .replace('.bin', '')
      .replaceAll('-', ' '),
    description: 'Unknown localAI model. Please update `models.data.ts` with this ID',
    contextWindow: null, // 'not provided'
    interfaces: [LLM_IF_OAI_Chat], // assume..
  });
}


// [Mistral]

const _knownMistralChatModels: ManualMappings = [

];


const mistralModelFamilyOrder = [
  'mistral-large', 'mistral-medium', 'mistral-small', 'open-mixtral-8x7b', 'mistral-tiny', 'open-mistral-7b', 'mistral-embed', '🔗',
];

export function mistralModelToModelDescription(_model: unknown): ModelDescriptionSchema {
  const model = wireMistralModelsListOutputSchema.parse(_model);
  return fromManualMapping(_knownMistralChatModels, model.id, model.created, undefined, {
    idPrefix: model.id,
    label: model.id.replaceAll(/[_-]/g, ' '),
    description: 'New Mistral Model',
    contextWindow: 32768,
    interfaces: [LLM_IF_OAI_Chat], // assume..
    hidden: true,
  });
}

export function mistralModelsSort(a: ModelDescriptionSchema, b: ModelDescriptionSchema): number {
  const aPrefixIndex = mistralModelFamilyOrder.findIndex(prefix => a.id.startsWith(prefix));
  const bPrefixIndex = mistralModelFamilyOrder.findIndex(prefix => b.id.startsWith(prefix));
  if (aPrefixIndex !== -1 && bPrefixIndex !== -1) {
    if (aPrefixIndex !== bPrefixIndex)
      return aPrefixIndex - bPrefixIndex;
    if (a.label.startsWith('🔗') && !b.label.startsWith('🔗')) return 1;
    if (!a.label.startsWith('🔗') && b.label.startsWith('🔗')) return -1;
    return b.label.localeCompare(a.label);
  }
  return aPrefixIndex !== -1 ? 1 : -1;
}


// [Oobabooga]
const _knownOobaboogaChatModels: ManualMappings = [];

const _knownOobaboogaNonChatModels: string[] = [
  'None', 'text-curie-001', 'text-davinci-002', 'all-mpnet-base-v2', 'text-embedding-ada-002',
  /* 'gpt-3.5-turbo' // used to be here, but now it's the way to select the activly loaded ooababooga model */
];

export function oobaboogaModelToModelDescription(modelId: string, created: number): ModelDescriptionSchema {
  let label = modelId.replaceAll(/[_-]/g, ' ').split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
  if (label.endsWith('.bin'))
    label = label.slice(0, -4);

  // special case for the default (and only 'chat') model
  if (modelId === 'gpt-3.5-turbo')
    label = 'anthropic';

  return fromManualMapping(_knownOobaboogaChatModels, modelId, created, undefined, {
    idPrefix: modelId,
    label: label,
    description: 'Oobabooga model',
    contextWindow: 4096, // FIXME: figure out how to the context window size from Oobabooga
    interfaces: [LLM_IF_OAI_Chat], // assume..
    hidden: _knownOobaboogaNonChatModels.includes(modelId),
  });
}


// [OpenRouter]

const orOldModelIDs = [
  'anthropic/claude-2.1', 'anthropic/claude-2.0', 'anthropic/claude-v1', 'anthropic/claude-1.2',
  'anthropic/claude-instant-v1-100k', 'anthropic/claude-v1-100k', 'anthropic/claude-instant-1.0',
];

const orModelFamilyOrder = [
  // great models (pickes by hand, they're free)
  // 'mistralai/mistral-7b-instruct', 'nousresearch/nous-capybara-7b',
  // great orgs
  'anthropic/',
];

export function openRouterModelFamilySortFn(a: { id: string }, b: { id: string }): number {
  const aPrefixIndex = orModelFamilyOrder.findIndex(prefix => a.id.startsWith(prefix));
  const bPrefixIndex = orModelFamilyOrder.findIndex(prefix => b.id.startsWith(prefix));

  // If both have a prefix, sort by prefix first, and then alphabetically
  if (aPrefixIndex !== -1 && bPrefixIndex !== -1)
    return aPrefixIndex !== bPrefixIndex ? aPrefixIndex - bPrefixIndex : a.id.localeCompare(b.id);

  // If one has a prefix and the other doesn't, prioritize the one with prefix
  return aPrefixIndex !== -1 ? -1 : 1;
}

export function openRouterModelToModelDescription(wireModel: object): ModelDescriptionSchema {

  // parse the model
  const model = wireOpenrouterModelsListOutputSchema.parse(wireModel);

  // parse pricing
  const pricing = {
    cpmPrompt: parseFloat(model.pricing.prompt),
    cpmCompletion: parseFloat(model.pricing.completion),
  };
  const isFree = pricing.cpmPrompt === 0 && pricing.cpmCompletion === 0;

  // openrouter provides the fields we need as part of the model object
  let label = model.name || model.id.replace('/', ' · ');
  if (isFree)
    label += ' · 🎁'; // Free? Discounted?

  // hidden: hide by default older models or models not in known families
  const hidden = orOldModelIDs.includes(model.id) || !orModelFamilyOrder.some(prefix => model.id.startsWith(prefix));

  return fromManualMapping([], model.id, undefined, undefined, {
    idPrefix: model.id,
    // latest: ...
    label,
    // created: ...
    // updated: ...
    description: model.description,
    contextWindow: model.context_length || 4096,
    maxCompletionTokens: model.top_provider.max_completion_tokens || undefined,
    pricing,
    interfaces: [LLM_IF_OAI_Chat],
    hidden,
  });
}


// [Together AI]

const _knownTogetherAIChatModels: ManualMappings = [
  {
    idPrefix: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
    label: 'Nous Hermes 2 - Mixtral 8x7B-DPO',
    description: 'Nous Hermes 2 Mixtral 7bx8 DPO is the new flagship Nous Research model trained over the Mixtral 7bx8 MoE LLM. The model was trained on over 1,000,000 entries of primarily GPT-4 generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.',
    contextWindow: 32768,
    pricing: {
      cpmPrompt: 0.0006,
      cpmCompletion: 0.0006,
    },
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    idPrefix: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-SFT',
    label: 'Nous Hermes 2 - Mixtral 8x7B-SFT',
    description: 'Nous Hermes 2 Mixtral 7bx8 SFT is the new flagship Nous Research model trained over the Mixtral 7bx8 MoE LLM. The model was trained on over 1,000,000 entries of primarily GPT-4 generated data, as well as other high quality data from open datasets across the AI landscape, achieving state of the art performance on a variety of tasks.',
    contextWindow: 32768,
    pricing: {
      cpmPrompt: 0.0006,
      cpmCompletion: 0.0006,
    },
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    idPrefix: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    label: 'Mixtral-8x7B Instruct',
    description: 'The Mixtral-8x7B Large Language Model (LLM) is a pretrained generative Sparse Mixture of Experts.',
    contextWindow: 32768,
    pricing: {
      cpmPrompt: 0.0006,
      cpmCompletion: 0.0006,
    },
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    idPrefix: 'mistralai/Mistral-7B-Instruct-v0.2',
    label: 'Mistral (7B) Instruct v0.2',
    description: 'The Mistral-7B-Instruct-v0.2 Large Language Model (LLM) is an improved instruct fine-tuned version of Mistral-7B-Instruct-v0.1.',
    contextWindow: 32768,
    pricing: {
      cpmPrompt: 0.0002,
      cpmCompletion: 0.0002,
    },
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    idPrefix: 'NousResearch/Nous-Hermes-2-Yi-34B',
    label: 'Nous Hermes-2 Yi (34B)',
    description: 'Nous Hermes 2 - Yi-34B is a state of the art Yi Fine-tune',
    contextWindow: 4097,
    pricing: {
      cpmPrompt: 0.0008,
      cpmCompletion: 0.0008,
    },
    interfaces: [LLM_IF_OAI_Chat],
  },
] as const;

export function togetherAIModelsToModelDescriptions(wireModels: unknown): ModelDescriptionSchema[] {

  function togetherAIModelToModelDescription(model: { id: string, created: number }) {
    return fromManualMapping(_knownTogetherAIChatModels, model.id, model.created, undefined, {
      idPrefix: model.id,
      label: model.id.replaceAll('/', ' · ').replaceAll(/[_-]/g, ' '),
      description: 'New Togehter AI Model',
      contextWindow: null, // unknown
      interfaces: [LLM_IF_OAI_Chat], // assume..
      hidden: true,
    });
  }

  function togetherAIModelsSort(a: ModelDescriptionSchema, b: ModelDescriptionSchema): number {
    if (a.hidden && !b.hidden)
      return 1;
    if (!a.hidden && b.hidden)
      return -1;
    if (a.created !== b.created)
      return (b.created || 0) - (a.created || 0);
    return a.id.localeCompare(b.id);
  }

  return wireTogetherAIListOutputSchema.parse(wireModels)
    .map(togetherAIModelToModelDescription)
    .sort(togetherAIModelsSort);
}


// Perplexity

const _knownPerplexityChatModels: ModelDescriptionSchema[] = [
  {
    id: 'codellama-34b-instruct',
    label: 'Codellama 34B Instruct (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Codellama 70B Instruct as a replacement.',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'codellama-70b-instruct',
    label: 'Codellama 70B Instruct',
    description: 'Code Llama is a collection of pretrained and fine-tuned generative text models. This model is designed for general code synthesis and understanding.',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'llama-2-70b-chat',
    label: 'Llama 2 70B Chat (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try mixtral-8x7b-instruct as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'mistral-7b-instruct',
    label: 'Mistral 7B Instruct',
    description: 'The Mistral-7B-Instruct-v0.1 Large Language Model (LLM) is a instruct fine-tuned version of the Mistral-7B-v0.1 generative text model using a variety of publicly available conversation datasets.',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'mixtral-8x7b-instruct',
    label: 'Mixtral 8x7B Instruct',
    description: 'The Mixtral-8x7B Large Language Model (LLM) is a pretrained generative Sparse Mixture of Experts.',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'pplx-7b-online',
    label: 'Perplexity 7B Online (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Small Online as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'pplx-70b-online',
    label: 'Perplexity 70B Online (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Medium Online as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'pplx-8x7b-online',
    label: 'Perplexity 8x7B Online (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Medium Online as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'pplx-7b-chat',
    label: 'Perplexity 7B Chat (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Small Chat as a replacement.',
    contextWindow: 8192,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'pplx-70b-chat',
    label: 'Perplexity 70B Chat (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Medium Chat as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'pplx-8x7b-chat',
    label: 'Perplexity 8x7B Chat (deprecated)',
    description: 'Will be removed on March 15th, 2024. Try Sonar Medium Chat as a replacement.',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  },
  {
    id: 'sonar-small-chat',
    label: 'Sonar Small Chat',
    description: 'Sonar Small Chat',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'sonar-medium-chat',
    label: 'Sonar Medium Chat',
    description: 'Sonar Medium Chat',
    contextWindow: 16384,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'sonar-small-online',
    label: 'Sonar Small Online 🌐',
    description: 'Sonar Small Online',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
  },
  {
    id: 'sonar-medium-online',
    label: 'Sonar Medium Online 🌐',
    description: 'Sonar Medium Online',
    contextWindow: 4096,
    interfaces: [LLM_IF_OAI_Chat],
  },
];

const perplexityAIModelFamilyOrder = [
  'sonar-medium', 'sonar-small', 'mixtral', 'mistral', 'codellama', 'llama-2', '',
];

export function perplexityAIModelDescriptions() {
  // change this implementation once upstream implements some form of models listing
  return _knownPerplexityChatModels;
}

export function perplexityAIModelSort(a: ModelDescriptionSchema, b: ModelDescriptionSchema): number {
  const aPrefixIndex = perplexityAIModelFamilyOrder.findIndex(prefix => a.id.startsWith(prefix));
  const bPrefixIndex = perplexityAIModelFamilyOrder.findIndex(prefix => b.id.startsWith(prefix));
  // sort by family
  if (aPrefixIndex !== -1 && bPrefixIndex !== -1)
    if (aPrefixIndex !== bPrefixIndex)
      return aPrefixIndex - bPrefixIndex;
  // then by reverse label
  return b.label.localeCompare(a.label);
}

// Groq

const _knownGroqModels: ManualMappings = [
  // {
  //   id: 'lama2-70b-4096',
  //   label: 'Llama 2 70B Chat',
  //   description: 'Llama 2 is a collection of pretrained and fine-tuned generative text models.',
  //   contextWindow: 4096,
  //   interfaces: [LLM_IF_OAI_Chat],
  // },
  {
    idPrefix: 'mixtral-8x7b-32768',
    label: 'Mixtral 8x7B Instruct v0.1',
    description: 'The Mixtral-8x7B Large Language Model (LLM) is a pretrained generative Sparse Mixture of Experts.',
    contextWindow: 32768,
    interfaces: [LLM_IF_OAI_Chat],
  },
];

export function groqModelToModelDescription(_model: unknown): ModelDescriptionSchema {
  const model = wireGroqModelsListOutputSchema.parse(_model);
  return fromManualMapping(_knownGroqModels, model.id, model.created, undefined, {
    idPrefix: model.id,
    label: model.id.replaceAll(/[_-]/g, ' '),
    description: 'New Model',
    contextWindow: 32768,
    interfaces: [LLM_IF_OAI_Chat],
    hidden: true,
  });
}


// Helpers

type ManualMapping = ({ idPrefix: string, isLatest?: boolean, isLegacy?: boolean, symLink?: string } & Omit<ModelDescriptionSchema, 'id' | 'created' | 'updated'>);
type ManualMappings = ManualMapping[];

function fromManualMapping(mappings: ManualMappings, id: string, created?: number, updated?: number, fallback?: ManualMapping): ModelDescriptionSchema {

  // find the closest known model, or fall back, or take the last
  const known = mappings.find(base => id.startsWith(base.idPrefix)) || fallback || mappings[mappings.length - 1];

  // label for symlinks
  let label = known.label;
  if (known.symLink && id === known.idPrefix)
    label = `🔗 ${known.label} → ${known.symLink}`;

  // check whether this is a partial map, which indicates an unknown/new variant
  const suffix = id.slice(known.idPrefix.length).trim();

  // return the model description sheet
  return {
    id,
    label: label
      + (suffix ? ` [${suffix.replaceAll('-', ' ').trim()}]` : '')
      + (known.isLatest ? ' 🌟' : '')
      + (known.isLegacy ? /*' 💩'*/ ' [legacy]' : ''),
    created: created || 0,
    updated: updated || created || 0,
    description: known.description,
    contextWindow: known.contextWindow,
    ...(!!known.maxCompletionTokens && { maxCompletionTokens: known.maxCompletionTokens }),
    ...(!!known.pricing && { pricing: known.pricing }),
    interfaces: known.interfaces,
    ...(!!known.hidden && { hidden: known.hidden }),
  };
}