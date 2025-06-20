import { render, screen, fireEvent } from '@testing-library/react'
import Assistant from '@/components/assistant'
import useConversationStore from '@/stores/useConversationStore'

jest.mock('@/lib/assistant', () => ({
  processMessages: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('@/components/chat', () => {
  const React = require('react')
  const useConversationStore = require('@/stores/useConversationStore').default
  return {
    __esModule: true,
    default: ({ onSendMessage }: { onSendMessage: (msg: string) => void }) => {
      const { currentPromptId, addUsedPromptId } = useConversationStore()
      return (
        <button
          data-testid="send-button"
          onClick={() => {
            if (currentPromptId !== null) addUsedPromptId(currentPromptId)
            onSendMessage('Hi')
          }}
        >
          Send
        </button>
      )
    },
  }
})

describe('Assistant', () => {
  it('records prompt id on send', () => {
    const store = useConversationStore.getState()
    store.setCurrentPromptId(3)
    render(<Assistant />)
    fireEvent.click(screen.getByTestId('send-button'))
    expect(useConversationStore.getState().usedPromptIds).toContain(3)
  })
})
