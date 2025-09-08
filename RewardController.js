class Reward {
  static async insertReward(rewardData) {
    // console.log(rewardData);
    const title = rewardData.title;
    const amount = rewardData.amount;
    const userId = rewardData.userId;
    const campaignId = rewardData.campaignId;
    await fetch(`http://localhost:3000/rewards`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount,
        userId,
        campaignId,
        date: new Date(),
      }),
    });
  }

  static async fetchLatestRewards(sort = "desc", col = "date") {
    const response = await fetch(
      `http://localhost:3000/rewards?_sort=${col}&_order=${sort}&_expand=user&_expand=campaign&_limit=5`
    );
    const data = await response.json();
    return data;
  }
}

export default Reward;
