import AuthService from "./AuthUser.js";
import Utilities from "./utilities.js";
const authService = new AuthService();
class Home {
  #campaignsContainer = document.getElementById("campaignsContainer");
  #rewardsSection = document.getElementById("rewardsSection");
  constructor() {
    this.lastCampaigns = [];
    this.bestRewards = [];
    this.initHomePages();
  }

  async setLastCampaigns() {
    const response = await fetch(
      `http://localhost:3000/campaigns?_embed=rewards&isApproved=true&_limit=5`
    );
    const data = await response.json();
    this.lastCampaigns = data;
  }

  get LastCampaigns() {
    return this.lastCampaigns;
  }

  async setBestRewards() {
    const response = await fetch(
      `http://localhost:3000/rewards?_expand=campaign&_limit=5&_sort=amount&_order=desc`
    );
    const data = await response.json();
    this.bestRewards = data;
  }

  get BestRewards() {
    return this.bestRewards;
  }

  renderSingleReward(r) {
    return `<div className="reward">
              ${r.title} — ${r.amount}
            </div>`;
  }

  renderRewardsCards(rewards) {
    if (rewards.length > 0) {
      return `<div className="rewards">
          ${rewards.map((r) => this.renderSingleReward(r)).join("")}
        </div>`;
    } else {
      return `<div className="rewards">No rewards listed.</div>`;
    }
  }

  renderCampaignCard(campaign) {
    return `
   <div class="campaign-card">
   <a href="./campaigns/view/?id=${campaign.id}" class="reset-anchor">
   <img src="${campaign.image}" alt="${campaign.title}">
   <div class="campaign-content">
        <h3>${campaign.title}</h3>
        <p>${campaign.description}</p>
        <div class="campaign-meta">
          <strong>Goal:</strong> ${campaign.goal} <br>
          <strong>Achieved:</strong> ${Utilities.sumRewards(
            campaign.rewards
          )} <br>
          <strong>Deadline:</strong> ${campaign.deadline}
        </div>
        ${this.renderRewardsCards(campaign.rewards)}
      </div>
      </a>
    </div>
    `;
  }

  renderCampaigns(data) {
    console.log("data=====>", data);

    const container = data.map((ele) => this.renderCampaignCard(ele)).join("");
    console.log("container", container);
    this.#campaignsContainer.insertAdjacentHTML("afterbegin", container);
    this.#campaignsContainer.insertAdjacentHTML(
      "beforeend",
      `<a href='./campaigns/' class="reset-anchor">
    <div class="campaign-card show-more">
      <spn>+ Show More</span>
    </div>
    </a>`
    );
  }

  renderRewardCard(reward) {
    return `
      <div class="reward-card">
          <h3>${reward.title}</h3>
          <p>Amount: $${reward.amount}</p>
          <small>Campaign: ${reward.campaign.title}</small>
      </div>
    `;
  }

  renderRewardCards(data) {
    const rewards = data.map((ele) => this.renderRewardCard(ele)).join("");
    return `<div class="rewards-cards">${rewards}</div>`;
  }

  renderRewards(data) {
    this.#rewardsSection.insertAdjacentHTML(
      "afterbegin",
      this.renderRewardCards(data)
    );
  }

  async initHomePages() {
    await this.setLastCampaigns();
    await this.setBestRewards();
    this.renderCampaigns(this.LastCampaigns);
    this.renderRewards(this.BestRewards);
  }
}

(async function () {
  authService.getStorage();
  await authService.renderHeder();
  console.log("isLogged", authService.isLoggedIn);
  console.log("user authorization");
  // render Home Page Content
  new Home();
})();
