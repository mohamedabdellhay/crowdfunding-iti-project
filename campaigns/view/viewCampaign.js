import AuthService from "../../AuthUser.js";
import RewardController from "../../NotificationsController.js";
import Utilities from "../../utilities.js";
console.log("start campaign view");

const authService = new AuthService();
const campaignId = new URLSearchParams(window.location.search).get("id");
console.log("camp id", campaignId);

document.addEventListener("click", async function (event) {
  // event.preventDefault();
  if (event.target.closest(".back-btn")) {
    window.location.href = "../";
  }
  if (event.target.closest("#reward-form>button")) {
    event.preventDefault();
    const title = document.getElementById("reward-title").value.trim();
    const amount = document.getElementById("reward-amount").value.trim();
    console.log("title", title, "value", amount);
    if (!title || !amount) {
      console.log("data is not filled");
      return;
    }

    RewardController.insertReward({
      title: title,
      amount: Number(amount),
      userId: Number(authService.userId),
      campaignId: Number(campaignId),
    });
  }
});

// document
//   .getElementById("reward-form")
//   .addEventListener("submit", function (event) {
//     event.preventDefault();
//     const title = document.querySelector("-");
//   });

class Campaign {
  #campaignContainer = document.querySelector(".campaign-view");
  constructor(camp) {
    this.title = camp.title;
    this.description = camp.description;
    this.image = camp.image;
    this.goal = camp.goal;
    this.isApproved = camp.isApproved;
    this.deadline = camp.deadline;
    this.rewards = camp.rewards;
    this.user = {
      name: camp.user.name,
      email: camp.user.email,
    };
  }

  renderImage(src, alt) {
    return `<img src="${src}" alt="${alt}">`;
  }

  renderDetails(goal, deadline, status) {
    return `
        <p><strong>Goal:</strong> ${goal}$</p>
        <p><strong>Achieved:</strong> ${Utilities.sumRewards(this.rewards)}$</p>
        <p><strong>Deadline:</strong> ${deadline}</p>
        <p>
            <strong>Status:</strong>

            ${
              status
                ? `<span class="status approved">Approved</span>`
                : `<span class="status pending">Pending</span>`
            }
            
        </p>
    `;
  }

  renderUserInfo(user) {
    return `
        <h3>Creator Info</h3>
        <p><strong>Name:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
    `;
  }

  renderRewardCard(r) {
    return `<li className="reward">
      <strong>${r.title}:</strong> <span class='reward-amount'>${r.amount}</span>
    </li>`;
  }

  renderRewards(rewards) {
    return `<ul id="rewards-list">
             ${
               rewards.length === 0
                 ? `<li>No rewards available.</li>`
                 : rewards.map((r) => this.renderRewardCard(r)).join("")
             } 
            </ul>`;
  }

  createCampaignHTML(campaign) {
    return `
        <div class="campaign-container">
            <!-- Campaign Image -->
            <div class="campaign-image">
                ${this.renderImage(campaign.image, campaign.title)}
            </div>
            <!-- Campaign Info -->
            <div class="campaign-content">
                <h2>${this.title}</h2>
                <p class="description">${this.description}</p>

                <div class="campaign-details">
                    ${this.renderDetails(
                      campaign.goal,
                      campaign.deadline,
                      campaign.isApproved
                    )}
                </div>

                <!-- User Info -->
                <div class="campaign-user">
                   ${this.renderUserInfo(campaign.user)}

                </div>

                <!-- Rewards -->
                <div class="campaign-rewards">
                    <h3>Rewards</h3>
                    ${this.renderRewards(campaign.rewards)}

                    <!-- Add Reward Form -->
                    ${
                      authService.isLoggedIn &&
                      authService.userId != campaign.userId
                        ? `<form id="reward-form">
                        <input type="text" id="reward-title" placeholder="Reward Title" required>
                        <input type="number" id="reward-amount" placeholder="Amount ($)" required>
                        <button type="button" class="bg-primary">+ Add Reward</button>
                    </form>`
                        : ``
                    }
                </div>

                <!-- Pledges
                <div class="campaign-pledges">
                    <h3>Pledges</h3>
                    <p>No pledges yet.</p>
                </div> -->

                <button class="back-btn bg-primary" type="button">⬅ Back to Campaigns</button>
            </div>
        </div>
    
    `;
  }

  renderCampaign(data) {
    document.title = `Campaign | ${this.title}`;
    this.#campaignContainer.innerHTML = "";
    this.#campaignContainer.insertAdjacentHTML(
      "afterbegin",
      this.createCampaignHTML(data)
    );
  }
}

(async function () {
  authService.getStorage();
  await authService.renderHeder();
  // get campaign id

  const response = await fetch(
    `http://localhost:3000/campaigns/${campaignId}?_expand=user&_embed=pledges&_embed=rewards&isApprovedtrue`
  );
  const campaignData = await response.json();

  const campaign = new Campaign(campaignData);
  campaign.renderCampaign(campaignData);
})();
