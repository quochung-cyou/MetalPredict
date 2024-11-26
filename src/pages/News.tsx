import NewsFeed from "@/components/NewsFeed";

const News = () => {
  return (
    <div className="p-8 space-y-6 animate-enter">
      <h1 className="text-4xl font-bold mb-8">Market News</h1>
      <NewsFeed />
    </div>
  );
};

export default News;