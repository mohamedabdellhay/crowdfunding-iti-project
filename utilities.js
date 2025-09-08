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
  static timeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diff = Math.floor((now - past) / 1000);

    if (diff < 60) {
      return `from ${diff} second${diff !== 1 ? "s" : ""} ago`;
    }

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) {
      return `from ${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    const hours = Math.floor(diff / 3600);
    if (hours < 24) {
      return `from ${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

    const days = Math.floor(diff / 86400);
    if (days < 30) {
      return `from ${days} day${days !== 1 ? "s" : ""} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
      return `from ${months} month${months !== 1 ? "s" : ""} ago`;
    }

    const years = Math.floor(days / 365);
    return `from ${years} year${years !== 1 ? "s" : ""} ago`;
  }
}

export default Utilities;
