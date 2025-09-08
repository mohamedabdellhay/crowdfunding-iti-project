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
      body: JSON.stringify({ title, amount, userId, campaignId }),
    });
  }
}

export default Reward;
