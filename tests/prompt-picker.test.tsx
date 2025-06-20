import { render, screen, fireEvent } from '@testing-library/react'
import PromptPicker from '@/components/prompt-picker'
import { usePrompts } from '@/hooks/use-prompts'
import useConversationStore from '@/stores/useConversationStore'

jest.mock('@/hooks/use-prompts')

;(usePrompts as jest.Mock).mockReturnValue({
  prompts: [
    { id: 1, name: 'Prompt One', prompt: 'Hello', category: 'gen', systemMessage: null, createdAt: '' },
    { id: 2, name: 'Second Prompt', prompt: 'World', category: 'gen', systemMessage: null, createdAt: '' },
  ],
})

describe('PromptPicker', () => {
  it('filters prompts and inserts text', () => {
    render(
      <div>
        <textarea id="prompt-textarea" />
        <PromptPicker open={true} onOpenChange={() => {}} />
      </div>
    )

    fireEvent.change(screen.getByPlaceholderText('Search prompts...'), { target: { value: 'Second' } })
    expect(screen.getByText('Second Prompt')).toBeInTheDocument()

    fireEvent.mouseDown(screen.getByText('Second Prompt'))
    expect((document.getElementById('prompt-textarea') as HTMLTextAreaElement).value).toBe('World')
    expect(useConversationStore.getState().currentPromptId).toBe(2)
  })
})
