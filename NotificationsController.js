class Notifications {
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

  static async fetchLatestRewards(date, sort = "desc", col = "date") {
    const response = await fetch(
      `http://localhost:3000/rewards?_sort=${col}&_order=${sort}&_expand=user&_expand=campaign&_limit=5&date_gte=${date}`
    );
    const data = await response.json();
    return data;
  }

  static async fetchAllNotifications(userId) {
    const API = `http://localhost:3000/rewards?_expand=campaign&_expand=user&_sort=date&_order=desc`;
    console.log("API", API);

    const response = await fetch(API);
    const data = await response.json();
    return data.filter((reward) => reward.campaign.userId == userId);
  }
}

export default Notifications;
