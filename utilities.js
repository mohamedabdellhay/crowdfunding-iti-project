class Utilities {
  static sumRewards(rewards = [{ amount: 0 }]) {
    const rewardsAmount = rewards
      .map((ele) => Number(ele.amount))
      .reduce((a, c) => a + c, 0);

    return rewardsAmount;
  }
  static removeImageField(data) {
    // Check if the 'image' key exists
    if ("image" in data) {
      delete data.image;
    }
    return data;
  }
}

export default Utilities;
