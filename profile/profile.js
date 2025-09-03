import AuthService from "../AuthUser.js";
const authService = new AuthService();

(async function () {
  authService.getStorage();
  await authService.renderHeder();
  console.log("isLogged", authService.isLoggedIn);
  console.log("user authorization");
  if (!authService.isLoggedIn) {
    window.location.href = "../login";
  }
  userStatus = await authService.userAuthorization(authService.token());
  console.log("user", userStatus);
})();

console.log("start Profile");
