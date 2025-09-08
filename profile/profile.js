import AuthService from "../AuthUser.js";
const authService = new AuthService();

console.log("start Profile");
const userState = {
  user: null,
  campaigns: [],
};

class User {
  #id = null;
  #email = null;
  #name = null;
  #campaigns = [];
  constructor(id, email, name, campaigns) {
    this.#id = id;
    this.#email = email;
    this.#name = name;
    this.#campaigns = campaigns;
  }
  set Email(email) {
    this.#email = email;
  }
  get Email() {
    return this.#email;
  }
  set Name(name) {
    this.#name = name;
  }
  get Name() {
    return this.#name;
  }
  set Campaigns(data) {
    this.#campaigns = data;
  }
  renderUserData() {}
  renderSingleCampaign(row) {
    return `
    <tr>
                            <td>1</td>
                            <td>
                                <img src="https://via.placeholder.com/100" alt="Campaign Image" />
                            </td>
                            <td>
                                <input class="input" value="Smart Watch Pro" data-camp="title" data-id="1">
                            </td>
                            <td>
                                <input type="number" class="input" value="15000" data-camp="goal" data-id="1">
                            </td>
                            <td>
                                <input type="date" class="input" value="2024-12-20" data-camp="deadline" data-id="1"
                                    disabled>
                            </td>
                            <td>
                                <label class="switch-label">
                                    <input type="checkbox" class="switch" checked data-action="toggle-approved"
                                        data-id="1">
                                    <span class="switch-slider"></span>
                                </label>
                            </td>
                            <td><span class="tag">No rewards</span></td>
                            <td>
                                <button class="btn small">Edit</button>
                                <button class="btn danger small">Delete</button>
                            </td>
                        </tr>`;
  }
  get Campaigns() {
    return this.#campaigns;
  }
}

class FetchData {
  static async fetchUserData(userId) {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
    const data = await response.json();

    return data;
  }

  static async fetchCampaignsData(userId) {
    const response = await fetch(
      `http://localhost:3000/campaigns?_expand=user&userId=${userId}`
    );
    const data = await response.json();

    return data;
  }
}

(async function () {
  authService.getStorage();
  await authService.renderHeder();
  console.log("isLogged", authService.isLoggedIn);
  console.log("user authorization");
  if (!authService.isLoggedIn) {
    window.location.href = "../login";
    return;
  }
  // start
  const userID = Number(localStorage.getItem("userId"));
  console.log("id", userID);

  const userData = await FetchData.fetchUserData(userID);
  const campaignData = await FetchData.fetchCampaignsData(userID);
  console.log(userData);
  let user = new User(userData.id, userData.email, userData.name, campaignData);
  console.log(user);
})();
