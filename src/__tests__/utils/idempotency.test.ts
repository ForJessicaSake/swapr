import { createIdempotencyKey } from "@/utils/idempotency";

describe("createIdempotencyKey", () => {
  it("returns a unique uuid", () => {
    const first = createIdempotencyKey();
    const second = createIdempotencyKey();

    expect(first).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(first).not.toBe(second);
  });
});
