// Client giả cho chế độ xem thử (chưa nối Supabase thật) — trả kết quả rỗng ngay lập tức
// thay vì gọi mạng thật tới URL placeholder (vốn khiến mỗi lượt chuyển trang chậm vài giây
// do phải chờ DNS/handshake thất bại).
//
// Dùng Proxy để tự động "nuốt" mọi method chain của Postgrest query builder
// (eq, order, not, in, gte...) mà không cần liệt kê thủ công từng cái — tránh
// vỡ build mỗi khi một trang dùng một method mới chưa có trong danh sách.

type QueryResult = { data: unknown; error: null; count: number | null };

function emptyResult(single: boolean, isCount: boolean): QueryResult {
  if (isCount) return { data: null, error: null, count: 0 };
  return { data: single ? null : [], error: null, count: null };
}

function createMockQuery() {
  let single = false;
  let isCount = false;

  const resolve = () => Promise.resolve(emptyResult(single, isCount));

  const handler: ProxyHandler<object> = {
    get(_target, prop: string) {
      if (prop === "single" || prop === "maybeSingle") {
        return () => {
          single = true;
          return proxy;
        };
      }
      if (prop === "then") return (onFulfilled?: (v: QueryResult) => unknown, onRejected?: (e: unknown) => unknown) =>
        resolve().then(onFulfilled, onRejected);
      if (prop === "catch") return (onRejected?: (e: unknown) => unknown) => resolve().catch(onRejected);
      if (prop === "finally") return (onFinally?: () => void) => resolve().finally(onFinally);
      // Bất kỳ method chain nào khác (eq, order, select, not, in, gte...) đều trả về chính nó.
      return (...args: unknown[]) => {
        if (prop === "select") {
          const opts = args[1] as { count?: string; head?: boolean } | undefined;
          if (opts?.count || opts?.head) isCount = true;
        }
        return proxy;
      };
    },
  };

  const proxy = new Proxy({}, handler) as unknown as Record<string, unknown>;
  return proxy;
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
