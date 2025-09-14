import AuthService from "../AuthUser.js";
import { Pledges, PledgesManager } from "../settings/settings.js";
const authService = new AuthService();

console.log("start Profile");

const DOM_SELECTION = {
  updatePasswordSection: document.getElementById("updatePasswordSection"),
  updatePasswordOverlay: document.getElementById("updatePasswordOverlay"),
  oldPassword: document.getElementById("old-password"),
  newPassword: document.getElementById("new-password"),
  confirmNewPassword: document.getElementById("confirm-new-password"),
  passwordErrorMessage: document.getElementById("password-error"),
};

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
  updatePassword(oldPass, newPass, confirmNewPass) {
    console.log("old ", oldPass);
    console.log("new ", newPass);
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
    const campaignsFooter = `<tr><td colspan="8"><a href="/settings#campaigns">See All...</a></td><tr>`;
    campaignsTable.push(campaignsFooter);
    this.renderCampaignsHeader(dataLength);
    this.#campaignsTableBody.innerHTML = campaignsTable.join("");
  }
}

document.addEventListener("click", async function (event) {
  if (event.target.closest("#updatePasswordBtn")) {
    console.log("update password");
    DOM_SELECTION.updatePasswordOverlay.classList.remove("hidden");
    DOM_SELECTION.updatePasswordSection.classList.remove("hidden");
  } else if (event.target.closest("#updatePasswordSection>button")) {
    console.log("user try to save data");
    const oldPasswordValue = DOM_SELECTION.oldPassword.value.trim();
    const newPasswordValue = DOM_SELECTION.newPassword.value.trim();
    const confirmPasswordValue = DOM_SELECTION.confirmNewPassword.value.trim();
    console.log("old", oldPasswordValue);
    console.log("new", newPasswordValue);
    console.log("confirm", confirmPasswordValue);
    if (newPasswordValue !== confirmPasswordValue) {
      DOM_SELECTION.passwordErrorMessage.innerHTML =
        "New password is not matched";

      return;
    }

    const updateRes = await fetch(
      `http://localhost:3000/users/${authService.userId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPasswordValue }),
      }
    );

    const data = await updateRes.json();
    console.log("data", data);
  } else if (event.target.closest("#updatePasswordOverlay")) {
    DOM_SELECTION.updatePasswordOverlay.classList.add("hidden");
    DOM_SELECTION.updatePasswordSection.classList.add("hidden");
  }
});

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

  await pledges.fetchData(authService.userId);
  pledges.renderAsHtml(
    `<tr><td colspan="6"><a href="/settings/#pledges">See All...</a></td><tr>`,
    3
  );
})();
