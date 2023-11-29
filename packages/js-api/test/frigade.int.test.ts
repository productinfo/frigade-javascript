import { FlowStep, Frigade } from '../src'
import { generateGuestId } from '../src/shared/utils'
import { getRandomID } from './util'
import { Flow } from '../src/.'

const testAPIKey = 'api_public_3MPLH7NJ9L0U963XKW7BPE2IT137GC6L742JLC2XCT6NOIYSI4QUI9I1RA3ZOGIL'
const testFlowId = 'flow_yJfjksFrs5QEH0c8'
const testFlowStepId = 'checklist-step-one'

test('can init Frigade', async () => {
  const frigade = new Frigade(testAPIKey, {})
  const flows = await frigade.getFlows()
  expect(flows.length).toBeGreaterThan(0)
})

test('flows have fields set', async () => {
  const frigade = new Frigade(testAPIKey, {})
  const flows = await frigade.getFlows()
  expect(
    flows.filter((flow) => flow.id && flow.rawData && flow.rawData.type).length
  ).toBeGreaterThan(0)
  const flow = flows[0]
  flow.steps.forEach((step) => {
    expect(step.id).toBeDefined()
    expect(step.title).toBeDefined()
  })
})

test('read and set flow state', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: generateGuestId(),
  })
  const flow = await frigade.getFlow(testFlowId)
  expect(flow).toBeDefined()
  expect(flow.id).toEqual(testFlowId)
  expect(flow.isCompleted).toBeFalsy()
  await flow.complete()
  expect(flow.isCompleted).toBeTruthy()
})

test('read and set flow step state', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: generateGuestId(),
  })
  const flow = await frigade.getFlow(testFlowId)
  expect(flow).toBeDefined()
  expect(flow.id).toEqual(testFlowId)
  const step = flow.steps.get(testFlowStepId)
  expect(step).toBeDefined()
  expect(step.isCompleted).toBeFalsy()
  expect(step.isStarted).toBeFalsy()
  await step.start()
  expect(step.isStarted).toBeTruthy()
  await step.complete()
  expect(step.isCompleted).toBeTruthy()
})

test('handle flow event changes', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: getRandomID(),
  })

  const callback1 = jest.fn((flow: Flow) => {
    if (flow.id != testFlowId) {
      return
    }
    expect(flow).toBeDefined()
    expect(flow.id).toEqual(testFlowId)
    expect(flow.isCompleted).toBeFalsy()
    expect(flow.isStarted).toBeTruthy()
  })
  frigade.onStateChange(callback1)
  const flow = await frigade.getFlow(testFlowId)
  expect(flow).toBeDefined()
  expect(flow.id).toEqual(testFlowId)
  expect(flow.isCompleted).toBeFalsy()
  expect(callback1).toHaveBeenCalledTimes(0)
  await flow.getStepByIndex(0).complete()
  expect(flow.isCompleted).toBeFalsy()
  expect(callback1).toHaveBeenCalled()
  frigade.removeStateChangeHandler(callback1)

  const callback2 = jest.fn((flow) => {
    if (flow.id != testFlowId) {
      return
    }
    expect(flow).toBeDefined()
    expect(flow.id).toEqual(testFlowId)
    expect(flow.isCompleted).toBeTruthy()
  })
  frigade.onStateChange(callback2)
  expect(callback2).toHaveBeenCalledTimes(0)
  await flow.complete()
  expect(flow.isCompleted).toBeTruthy()
  expect(callback2).toHaveBeenCalled()
  frigade.removeStateChangeHandler(callback2)
})

test('handle flow event changes unsubscribe', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: getRandomID(),
  })
  const callback = jest.fn(() => {})
  frigade.onStateChange(callback)
  const flow = await frigade.getFlow(testFlowId)
  expect(flow).toBeDefined()
  expect(flow.id).toEqual(testFlowId)
  expect(flow.isCompleted).toBeFalsy()
  frigade.removeStateChangeHandler(callback)
  await flow.complete()
  expect(flow.isCompleted).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(0)
})

test('handle single flow event changes subscribes and unsubscribes', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: getRandomID(),
  })
  const callback = jest.fn((flow: Flow) => {
    expect(flow).toBeDefined()
    expect(flow.id).toEqual(testFlowId)
  })
  const flow = await frigade.getFlow(testFlowId)
  flow.onStateChange(callback)
  expect(flow).toBeDefined()
  expect(flow.id).toEqual(testFlowId)
  expect(flow.isCompleted).toBeFalsy()
  expect(flow.isStarted).toBeFalsy()
  expect(callback).toHaveBeenCalledTimes(0)
  await flow.complete()
  expect(flow.isCompleted).toBeTruthy()
  expect(callback).toHaveBeenCalledTimes(2)
  flow.removeStateChangeHandler(callback)
})

test('handle step event changes', async () => {
  const frigade = new Frigade(testAPIKey, {
    userId: getRandomID(),
  })

  const callback = jest.fn((step: FlowStep) => {
    expect(step).toBeDefined()
    expect(step.id).toEqual(testFlowStepId)
  })
  const flow = await frigade.getFlow(testFlowId)

  expect(callback).toHaveBeenCalledTimes(0)
  flow.steps.get(testFlowStepId).onStateChange(callback)
  expect(callback).toHaveBeenCalledTimes(0)
  await flow.steps.get(testFlowStepId).start()
  expect(callback).toHaveBeenCalledTimes(1)
  await flow.steps.get(testFlowStepId).complete()
  expect(callback).toHaveBeenCalledTimes(2)
})
