import AuthService from "../AuthUser.js";
import { Pledges, PledgesManager } from "../settings/settings.js";
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
  #role = null;
  #campaigns = [];
  constructor(id, email, name, role, campaigns) {
    this.#id = id;
    this.#email = email;
    this.#name = name;
    this.#role = role;
    this.#campaigns = campaigns;
  }

  set Id(val) {
    throw new Error("id is not editable");
  }
  get Id() {
    return this.#id;
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
  get Campaigns() {
    return this.#campaigns;
  }
  set Role(val) {
    throw new Error("Role is Editable by Admin Only");
  }
  get Role() {
    return this.#role;
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
}

class FetchData {
  static async fetchUserData(userId) {
    const response = await fetch(`http://localhost:3000/users/${userId}`);
    const data = await response.json();

    return data;
  }

  static async fetchCampaignsData(userId) {
    const response = await fetch(
      `http://localhost:3000/campaigns?_expand=user&_embed=rewards&userId=${userId}`
    );
    const data = await response.json();

    return data;
  }
}

class Profile {
  #profileCard = document.querySelector(".profile-card");
  renderProfile(id, name, email, role, status) {
    const card = `
    ${this.renderHeader(name, email)}
    ${this.renderDetails(id, role, status)}
      `;

    this.#profileCard.insertAdjacentHTML("afterbegin", card);
  }
  renderHeader(userName, userEmail) {
    return `
                <div class="profile-header">
                    <div class="user-avatar">
                        <span>${userName.trim()[0].toUpperCase()}</span>
                    </div>
                    <div class="user-info">
                        <h2>${userName}</h2>
                        <p class="email">${userEmail}</p>
                    </div>
                </div>
    `;
  }
  renderDetails(id, role, status) {
    return `
          <div class="profile-details">
              <div class="detail">
                  <span class="label">ID:</span>
                  <span class="value">${id}</span>
              </div>
              <div class="detail">
                  <span class="label">Role:</span>
                  <span class="value">${role ?? "user"}</span>
              </div>
              <div class="detail">
                  <span class="label">Status:</span>
                  <span class="value active">${status}</span>
              </div>
              <div class="detail">
                  <span class="label">Valid:</span>
                  <span class="value valid">Yes</span>
              </div>
          </div>
    `;
  }
}

class Campaigns {
  #campaignsTableBody = document.querySelector(
    ".campaigns-section table tbody"
  );

  renderCampaignsHeader(CampaignsLength) {
    document.querySelector(
      ".campaigns-section .campaigns-header"
    ).innerHTML = `<span>My Campaigns</span><span>Count: ${CampaignsLength}</span>`;
  }

  renderCampaignRow(id, image, title, goal, deadline, rewards, date) {
    console.log(rewards);
    return `
        <tr>
            <td>${id}</td>
            <td>
                <img src="${image}" alt="${title}" />
            </td>
            <td>
                <input class="input" value="${title}" data-camp="title" data-id="1">
            </td>
            <td>
                <input type="number" class="input" value="${goal}" data-camp="goal" data-id="1">
            </td>
             <td>
                    <span class="tag">${date?.split("T")[0]}</span>
            </td>
            <td>
                    <span class="tag">${deadline}</span>
            </td>
            <td>
                <label class="switch-label" style="cursor:not-allowed">
                    <input type="checkbox" class="switch" checked data-action="toggle-approved"
                        data-id="1" disabled >
                    <span class="switch-slider"></span>
                </label>
            </td>
            <td><span class="tag">${
              rewards.length > 0 ? `${rewards.length} Pledges` : "No Pledges"
            }</span></td>
            <td>
                <button class="btn small">Edit</button>
                <button class="btn danger small">Delete</button>
            </td>
        </tr>
  `;
  }

  renderCampaignTable(data) {
    console.log(data);
    const dataLength = data.length;
    data.length = dataLength >= 3 ? 3 : dataLength;
    const campaignsTable = data.map((row) =>
      this.renderCampaignRow(
        row.id,
        row.image,
        row.title,
        row.goal,
        row.deadline,
        row.rewards,
        row.date
      )
    );
    const campaignsFooter = `<tr><td colspan="8"><a href="/settings">See All...</a></td><tr>`;
    campaignsTable.push(campaignsFooter);
    this.renderCampaignsHeader(dataLength);
    this.#campaignsTableBody.innerHTML = campaignsTable.join("");
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
  let user = new User(
    userData.id,
    userData.email,
    userData.name,
    userData.role,
    campaignData
  );
  console.log(user);

  try {
    new Profile().renderProfile(
      user.Id,
      user.Name,
      user.Email,
      user.Role,
      "active"
    );
  } catch (err) {
    console.log("new Error ", err);
  }

  try {
    new Campaigns().renderCampaignTable(user.Campaigns);
  } catch (err) {
    console.log("new Error ", err);
  }

  const pledges = new PledgesManager();

  await pledges.fetchData(authService.userId, 3);
  pledges.renderAsHtml();
})();
