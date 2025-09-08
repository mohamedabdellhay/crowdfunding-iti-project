import AuthService from "../AuthUser.js";
import Utilities from "../utilities.js";
const authService = new AuthService();

console.log("start campaigns");

// ===== API Configuration =====
// http://localhost:3000/posts?_expand=user
const API_CONFIG = {
  baseURL: "http://localhost:3000/",
  endpoints: {
    campaigns: "campaigns?_expand=user&_embed=pledges&_embed=rewards",
  },
  query: {
    isApproved: true,
    expand: "_expand=user",
  },
  headers: {
    "Content-Type": "application/json",
    // 'Authorization': 'Bearer your-token-here'
  },
};

const util = {
  hasEmptyFields(obj) {
    return Object.entries(obj).some(([key, value]) => {
      return value === null || value === "";
    });
  },
};

const DOM_SELECTION = {
  tableBody: document.querySelector("#campaignsTable>tbody"),
  createCampaignContainer: document.getElementById("createNewCampaign"),
  caretCampaignBtn: document.querySelector("#createNewCampaign>button"),
  newCampaignForm: document.getElementById("newCampaign"),
  newCampaignOverLay: document.getElementById("newCampaignOverLay"),
  campaignData: {
    title: document.getElementById("campaignTitle"),
    description: document.getElementById("campaignDescription"),
    image: document.getElementById("uploadedImage"),
    amount: document.getElementById("campaignAmount"),
    startDate: document.getElementById("startDate"),
    deadline: document.getElementById("campaignDeadline"),
  },
};

// page state
const APP_STATE = {
  campaigns: [],
  length: 0,
};

class Campaign {
  constructor(campaignData) {
    this.id = campaignData.id;
    this.title = campaignData.title;
    this.user = campaignData.user;
    this.goal = campaignData.goal;
    this.deadline = campaignData.deadline;
    this.isApproved = campaignData.isApproved;
    this.rewards = campaignData.rewards || [];
  }

  generateRewardsHtml() {
    if (this.rewards.length > 0) {
      return this.rewards.map(
        (reward) =>
          `<span class="tag">${reward.title}: $${reward.amount}</span>`
      );
    }
    return null;
  }
  generateActions() {
    console.log("render actions", authService.isLoggedIn);
    console.log(authService);

    return authService.userEmail === this.user.email
      ? `<button class="icon-btn edit" data-action="edit-campaign" data-id="${this.id}">Edit</button>
                <button class="icon-btn" data-action="delete-campaign" data-id="${this.id}">Delete</button>`
      : authService.isLoggedIn
      ? `<button class="icon-btn" data-action="delete-campaign" data-id="${this.id}">Add Reward</button>`
      : `<button class="icon-btn" onclick="window.location.href='../login'">Login to Add Reward</button>`;
  }
  generateTableRow() {
    const rewardsHtml = this.generateRewardsHtml();

    return `
     <tr>
        <td>${this.id}</td>
            <td>
                <div class="inline-edit">
                  <a href="./view/?id=${this.id}">${this.title || ""}</a>
                   
                </div>
            </td>
            <td>${this.user ? this.user.name : "—"}</td>
            <td>
                <div class="inline-edit">
                
                    <input type="number" class="input" value="${
                      this.goal || 0
                    }" data-camp="goal" data-id="${this.id}"/>
                </div>
            </td>
            <td>
                <div class="inline-edit">
                    <input type="date" class="input" value="${
                      this.deadline || ""
                    }" data-camp="deadline" data-id="${this.id}"/>
                </div>
            </td>
            <td>
                <label style="display:inline-flex;align-items:center;gap:8px">
                    <input type="checkbox" class="switch" ${
                      this.isApproved ? "checked" : ""
                    } data-action="toggle-approved" data-id="${this.id}">
                </label>
            </td>
            <td>${rewardsHtml || '<span class="tag">No rewards</span>'}</td>
            <td class="actions">${this.generateActions()}</td>
    </tr>
    `;
  }
  generateNewCampaign() {}
}

class CampaignManager {
  constructor() {
    this.campaigns = [];
    this.length = 0;
  }

  static async createNewCampaign() {
    const userId = localStorage.getItem("userId");
    const formData = DOM_SELECTION.campaignData;
    const file = formData.image.files[0];
    let imageBase64 = null;

    if (file) {
      imageBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // Base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    return {
      title: formData.title.value,
      userId: userId,
      description: formData.description.value,
      image: imageBase64,
      goal: formData.amount.value,
      deadline: formData.deadline.value,
      isApproved: false,
    };
  }

  async fetchAllCampaigns() {
    // http://localhost:3000/campaigns?_expand=user&_embed=pledges&&_embed=rewards
    const api = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.campaigns}&isApproved=${API_CONFIG.query.isApproved}`;
    console.log("api", api);

    const data = await fetch(api);
    const campaignsData = await data.json();

    this.campaigns = campaignsData.map(
      (campaignData) => new Campaign(campaignData) // create a object of type campaign
    );
    this.length = this.campaigns.length;

    APP_STATE.campaigns = this.campaigns;
    APP_STATE.length = this.length;
    console.log("APP_STATE", APP_STATE);

    this.renderTable();
  }

  renderTable() {
    const campaignsHtml = this.campaigns.map((campaign) =>
      campaign.generateTableRow()
    );
    console.log("campaigns", campaignsHtml);
    DOM_SELECTION.tableBody.innerHTML = campaignsHtml;
  }

  static async fetchCampaignById(id) {
    const response = await fetch(`http://localhost:3000/campaigns/${id}`);
    const data = await response.json();
    console.log("data", data);

    return data;
  }
}

// init date
function initDate() {
  const today = new Date();
  const year = today.getFullYear();
  let month = (today.getMonth() + 1).toString(); // Month is 0-indexed
  let day = today.getDate().toString();

  // Pad with leading zero if needed
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + day;
  }

  return `${year}-${month}-${day}`;
}

// listening on the dom events
function toggleCampaignOperation() {
  DOM_SELECTION.newCampaignForm.classList.toggle("hidden");
  DOM_SELECTION.newCampaignOverLay.classList.toggle("hidden");
}

function domListener() {
  document.addEventListener("click", function (event) {
    if (event.target.closest(".createNewCampaignBtn")) {
      console.log("createNewCampaignBtn");
      console.log(DOM_SELECTION.newCampaignForm);
      document.forms[0].method = "get";
      toggleCampaignOperation();
      startDate.value = initDate();
    }
    if (event.target.closest("#close")) {
      DOM_SELECTION.newCampaignForm.classList.add("hidden");
      DOM_SELECTION.newCampaignOverLay.classList.add("hidden");
      // document.forms[0].reset();
    }
    if (event.target.closest("#close_reset")) {
      DOM_SELECTION.newCampaignForm.classList.add("hidden");
      DOM_SELECTION.newCampaignOverLay.classList.add("hidden");
      document.forms[0].reset();
    }

    if (event.target.closest(".edit")) {
      editCampaign(event.target);
    }
  });

  // listen for image upload
  document
    .getElementById("uploadImageBox")
    .addEventListener("click", function () {
      this.previousElementSibling.click();
    });
}

// render create campaign button
function renderCreateCampaignBtn(isLoggedIn) {
  isLoggedIn
    ? (DOM_SELECTION.createCampaignContainer.innerHTML =
        ' <button class="btn createNewCampaignBtn">Create Campaign</button>')
    : (DOM_SELECTION.createCampaignContainer.innerHTML = "");
}

// listen for form submit
function listenForFormSubmit() {
  document.forms[0].addEventListener("submit", async function (event) {
    event.preventDefault();
    let data = await CampaignManager.createNewCampaign();
    console.log("form data", data);
    console.log(this.method);
    if (this.method === "post") {
      console.log("start edit campaign");
      // return;
      if (data.image === null) {
        data = Utilities.removeImageField(data);
      }
      console.log("new data: ", data);

      // return;
      const newCampaign = await fetch(
        `http://localhost:3000/campaigns/${location.hash.slice(1)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      console.log(await newCampaign.json());
      return;
    }

    if (util.hasEmptyFields(data)) {
      console.log("object has empty fields");
      return;
    }

    const newCampaign = await fetch(`http://localhost:3000/campaigns`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(await newCampaign.json());
  });
}

async function editCampaign(ele) {
  const campaignId = ele.dataset.id;
  console.log("start edit campaign with id: ", campaignId);
  location.hash = `#${campaignId}`;
  const campaignToEdit = await CampaignManager.fetchCampaignById(campaignId);
  console.log("campaign to edit: ", campaignToEdit);
  document.forms[0].method = "post";
  toggleCampaignOperation();
  const formInputs = DOM_SELECTION.campaignData;
  formInputs.title.value = campaignToEdit.title;
  formInputs.description.value = campaignToEdit.description;
  formInputs.amount.value = campaignToEdit.goal;
  formInputs.deadline.value = campaignToEdit.deadline;

  DOM_SELECTION;
}

(async function () {
  authService.getStorage();
  await authService.renderHeder();

  renderCreateCampaignBtn(authService.isLoggedIn);

  domListener();
  // fetch all campaigns
  const campaignManager = new CampaignManager();
  campaignManager.fetchAllCampaigns();
  console.log("state", APP_STATE);

  listenForFormSubmit();
})();
