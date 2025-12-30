import {
  isMissingColumnError,
  isMissingPromptMetadataColumns,
  normalizePromptRow,
  runPromptQuery,
} from "@/lib/prompt-metadata"

describe("prompt metadata helpers", () => {
  it("detects missing column via postgres error code", () => {
    expect(isMissingColumnError({ code: "42703" }, "usageCount")).toBe(true)
  })

  it("detects missing column via message match", () => {
    expect(
      isMissingColumnError(
        { message: 'column "usageCount" does not exist' },
        "usageCount",
      ),
    ).toBe(true)
  })

  it("returns false for non-matching errors", () => {
    expect(isMissingColumnError({ code: "12345" }, "usageCount")).toBe(false)
  })

  it("detects missing prompt metadata columns", () => {
    expect(isMissingPromptMetadataColumns({ code: "42703" })).toBe(true)
  })

  it("normalizes prompt row defaults", () => {
    expect(normalizePromptRow({})).toEqual({ usageCount: 0, isFavorite: false })
    expect(normalizePromptRow({ usageCount: "3", isFavorite: true })).toEqual({
      usageCount: 3,
      isFavorite: true,
    })
  })

  it("falls back when columns remain missing", async () => {
    const primary = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce({ code: "42703" })
      .mockRejectedValueOnce({ code: "42703" })
    const fallback = jest.fn<Promise<string>, []>().mockResolvedValue("fallback")
    const ensureColumns = jest.fn<Promise<void>, []>().mockResolvedValue()

    await expect(
      runPromptQuery({ primary, fallback, ensureColumns }),
    ).resolves.toBe("fallback")

    expect(primary).toHaveBeenCalledTimes(2)
    expect(fallback).toHaveBeenCalledTimes(1)
    expect(ensureColumns).toHaveBeenCalledTimes(1)
  })

  it("retries primary after ensuring columns", async () => {
    const primary = jest
      .fn<Promise<string>, []>()
      .mockRejectedValueOnce({ code: "42703" })
      .mockResolvedValue("primary")
    const fallback = jest.fn<Promise<string>, []>().mockResolvedValue("fallback")
    const ensureColumns = jest.fn<Promise<void>, []>().mockResolvedValue()

    await expect(
      runPromptQuery({ primary, fallback, ensureColumns }),
    ).resolves.toBe("primary")

    expect(primary).toHaveBeenCalledTimes(2)
    expect(fallback).not.toHaveBeenCalled()
  })

  it("throws non-missing column errors", async () => {
    const primary = jest.fn<Promise<string>, []>().mockRejectedValue(new Error("boom"))
    const fallback = jest.fn<Promise<string>, []>().mockResolvedValue("fallback")

    await expect(runPromptQuery({ primary, fallback })).rejects.toThrow("boom")
    expect(fallback).not.toHaveBeenCalled()
  })
})
