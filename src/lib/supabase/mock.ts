// Client giả cho chế độ xem thử (chưa nối Supabase thật) — trả kết quả rỗng ngay lập tức
// thay vì gọi mạng thật tới URL placeholder (vốn khiến mỗi lượt chuyển trang chậm vài giây
// do phải chờ DNS/handshake thất bại). Chỉ bao phủ đúng các method đang được dùng trong app.

type QueryResult = { data: unknown; error: null; count: number | null };

function emptyResult(single: boolean, isCount: boolean): QueryResult {
  if (isCount) return { data: null, error: null, count: 0 };
  return { data: single ? null : [], error: null, count: null };
}

const CHAIN_METHODS = [
  "select",
  "insert",
  "update",
  "delete",
  "upsert",
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "like",
  "ilike",
  "is",
  "in",
  "contains",
  "or",
  "order",
  "limit",
  "range",
  "match",
] as const;

function createMockQuery() {
  let single = false;
  let isCount = false;

  const builder: Record<string, unknown> = {};

  for (const method of CHAIN_METHODS) {
    builder[method] = (...args: unknown[]) => {
      if (method === "select") {
        const opts = args[1] as { count?: string; head?: boolean } | undefined;
        if (opts?.count || opts?.head) isCount = true;
      }
      return builder;
    };
  }

  builder.single = () => {
    single = true;
    return builder;
  };
  builder.maybeSingle = () => {
    single = true;
    return builder;
  };
  builder.then = (onFulfilled?: (v: QueryResult) => unknown, onRejected?: (e: unknown) => unknown) =>
    Promise.resolve(emptyResult(single, isCount)).then(onFulfilled, onRejected);
  builder.catch = (onRejected?: (e: unknown) => unknown) => Promise.resolve(emptyResult(single, isCount)).catch(onRejected);

  return builder;
}

const DEMO_AUTH_ERROR = { message: "Đang ở chế độ xem thử — chưa nối Supabase thật nên không thể đăng nhập/đăng ký." };

export function createMockSupabaseClient() {
  return {
    from: () => createMockQuery(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { session: null, user: null }, error: DEMO_AUTH_ERROR }),
      signUp: () => Promise.resolve({ data: { session: null, user: null }, error: DEMO_AUTH_ERROR }),
      signOut: () => Promise.resolve({ error: null }),
    },
  };
}
