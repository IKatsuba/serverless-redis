import { redisClient } from './redis-client';
import { isObject } from './utils/is-object';

interface ValidationResponse {
  status: string;
  message?: string;
  data?: any;
}

export async function validateRedisBody(body: any): Promise<ValidationResponse> {
  if (Array.isArray(body)) {
    return { status: 'ok', data: body };
  } else {
    return {
      status: 'error',
      message:
        'Invalid command array. Expected a string array at root of the command and its arguments.',
    };
  }
}

export async function validatePipelineRedisBody(body: any): Promise<ValidationResponse> {
  if (Array.isArray(body)) {
    return { status: 'ok', data: body };
  } else {
    return {
      status: 'error',
      message: 'Invalid command array. Expected an array of string arrays at root.',
    };
  }
}

export async function handleCommand(body: any) {
  const validation = await validateRedisBody(body);
  if (validation.status === 'error') {
    return { status: 'malformed_data', message: validation.message };
  }

  const commandArray = validation.data;
  return dispatchCommand(commandArray);
}

export async function handleCommandArray(body: any) {
  const validation = await validatePipelineRedisBody(body);
  if (validation.status === 'error') {
    return { status: 'malformed_data', message: validation.message };
  }

  const commandArray = validation.data;
  return dispatchCommandArray(commandArray);
}

export async function handleCommandTransactionArray(body: any) {
  const validation = await validatePipelineRedisBody(body);

  const commandArray = validation.data;
  return dispatchCommandTransactionArray(commandArray);
}

export async function dispatchCommand(commandArray: any[]) {
  // Mock implementation of dispatching a command

  return redisClient?.redisCommand(commandArray).then((response) => {
    if (isObject(response.result)) {
      response.result = Object.entries(response.result).flat();
    }

    return response;
  });
}

export async function dispatchCommandArray(commandArray: any[], responses: any[] = []) {
  for (const current of commandArray) {
    const result = await dispatchCommand(current);
    if (result.status !== 'ok') {
      return result;
    }
    responses.push(result);
  }
  return { status: 'ok', result: responses };
}

export async function dispatchCommandTransactionArray(commandArray: any[], responses: any[] = []) {
  for (const current of commandArray) {
    const result = await dispatchCommand(current);
    if (result.status !== 'ok') {
      return result;
    }
    responses.push(result);
  }
  return { status: 'ok', result: responses };
}
