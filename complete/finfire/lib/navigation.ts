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

export const getIsPublicRoute = (pathname: string) => {
  const publicRoutes = [
    NavigationRoutes.LOGIN,
    NavigationRoutes.SIGNUP,
    NavigationRoutes.LOGOUT,
    NavigationRoutes.HOME,
  ];
  const isPublicRoute = publicRoutes.includes(pathname as NavigationRoutes);
  return isPublicRoute;
};
