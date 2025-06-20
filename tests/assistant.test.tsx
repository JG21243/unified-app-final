import { render, screen, fireEvent } from '@testing-library/react'
import Assistant from '@/components/assistant'
import useConversationStore from '@/stores/useConversationStore'

jest.mock('@/lib/assistant', () => ({
  processMessages: jest.fn().mockResolvedValue(undefined)
}))

describe('Assistant', () => {
  it('records prompt id on send', async () => {
    const store = useConversationStore.getState()
    store.setCurrentPromptId(3)
    render(<Assistant />)
    fireEvent.change(screen.getByPlaceholderText('Message Gemini...'), { target: { value: 'Hi' } })
    fireEvent.click(screen.getByTestId('send-button'))
    expect(useConversationStore.getState().usedPromptIds).toContain(3)
  })
})
