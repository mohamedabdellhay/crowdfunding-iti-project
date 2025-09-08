import AuthService from "../AuthUser.js";

class TopDonors {
  #topDonorsTableBody = document.getElementById("topDonorsTableBody");
  constructor() {
    this.donors = [];
  }

  async fetchTopDonors() {
    const response = await fetch(`http://localhost:3000/users?_embed=rewards`);
    const data = await response.json();
    this.donors = data;
  }

  prosesDonors() {
    console.log(this.donors);

    return this.donors
      .map((ele) => {
        const name = ele.name;
        const email = ele.email;
        const rewardsCount = ele.rewards.length;
        const sumRewards = ele.rewards
          .map((ele) => Number(ele.amount))
          .reduce((a, c) => a + c);
        return {
          name,
          email,
          rewardsCount,
          sumRewards,
        };
      })
      .sort((a, b) => b.sumRewards - a.sumRewards);
  }

  renderSingleCard(donor) {
    return `
      <tr>
          <td>${donor.name}</td>
          <td>${donor.email}</td>
          <td>${donor.rewardsCount}</td>
          <td class="total">$${donor.sumRewards}</td>
      </tr>
  `;
  }

  renderTopDonors() {
    return this.prosesDonors()
      .map((donor) => this.renderSingleCard(donor))
      .join("");
  }

  renderTableBody() {
    this.#topDonorsTableBody.innerHTML = "";
    this.#topDonorsTableBody.insertAdjacentHTML(
      "afterbegin",
      this.renderTopDonors()
    );
  }
}

(async function () {
  const authService = new AuthService();
  authService.getStorage();
  await authService.renderHeder();
  console.log("isLogged", authService.isLoggedIn);

  const topDonors = new TopDonors();
  await topDonors.fetchTopDonors();
  console.log("top", topDonors.prosesDonors());

  topDonors.renderTableBody();
})();
