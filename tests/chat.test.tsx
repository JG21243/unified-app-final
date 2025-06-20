import { render, fireEvent, screen } from '@testing-library/react'
import Chat from '../components/chat'

describe('Chat prompt picker', () => {
  const prompts = [
    { id: 1, name: 'Hello', prompt: 'Hello world' },
    { id: 2, name: 'Bye', prompt: 'Goodbye' },
  ]

  test('popup opens and searches', () => {
    render(<Chat items={[]} onSendMessage={() => {}} isLoading={false} prompts={prompts} onSelectPrompt={() => {}} />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Bye' } })
    expect(screen.getByText('Bye')).toBeInTheDocument()
  })

  test('prompt drops into chat box', () => {
    render(<Chat items={[]} onSendMessage={() => {}} isLoading={false} prompts={prompts} onSelectPrompt={() => {}} />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    fireEvent.click(screen.getByText('Hello'))
    const textarea = screen.getByPlaceholderText('Message Gemini...') as HTMLTextAreaElement
    expect(textarea.value).toBe('Hello world')
  })

  test('sending message stores prompt id', () => {
    const onSelect = jest.fn()
    render(<Chat items={[]} onSendMessage={() => {}} isLoading={false} prompts={prompts} onSelectPrompt={onSelect} />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    fireEvent.click(screen.getByText('Hello'))
    fireEvent.click(screen.getByTestId('send-button'))
    expect(onSelect).toHaveBeenCalledWith({ id: 1, prompt: 'Hello world' })
  })
})
