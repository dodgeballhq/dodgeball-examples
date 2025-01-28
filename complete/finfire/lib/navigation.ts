export enum NavigationRoutes {
  HOME = "/",
  DASHBOARD = "/dashboard",
  TRANSACTIONS = "/transactions",
  NEW_TRANSACTION = "/transactions/create",
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
}

export const getIsPublicRoute = (pathname: string) => {
  const publicRoutes = [
    NavigationRoutes.LOGIN,
    NavigationRoutes.SIGNUP,
    NavigationRoutes.LOGOUT,
    NavigationRoutes.HOME,
    ApiRoutes.LOGIN,
  ];
  const isPublicRoute = publicRoutes.includes(pathname as NavigationRoutes);
  return isPublicRoute;
};
