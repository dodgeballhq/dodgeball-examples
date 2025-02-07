export enum NavigationRoutes {
  ROOT = "/",
  HOME = "/home",
  LOGOUT = "/auth/logout",
  LOGIN = "/auth/login",
  SIGNUP = "/auth/signup",
  PROFILE = "/profile",
  SUPPORT = "/support",
}

export enum ApiRoutes {
  LOGIN = "/api/auth/login",
  LOGOUT = "/api/auth/logout",
  ME = "/api/auth/me",
  CHECKPOINT = "/api/checkpoint",
  EVENT = "/api/event",
  TRANSACTIONS = "/api/transactions",
  TRANSACTION_CREATE = "/api/transactions/create",
  BALANCES = "/api/balances",
}

export const getIsPublicRoute = (pathname: string) => {
  const publicRoutes = [
    NavigationRoutes.LOGIN,
    NavigationRoutes.SIGNUP,
    NavigationRoutes.LOGOUT,
    NavigationRoutes.ROOT,
    ApiRoutes.LOGIN,
  ];
  const isPublicRoute = publicRoutes.includes(pathname as NavigationRoutes);
  return isPublicRoute;
};
