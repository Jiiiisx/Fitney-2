import { Heart, MessageSquare, Share2, Image as ImageIcon, Send } from "lucide-react";

// A more detailed Post component
const Post = ({ post }: { post: any }) => (
  <div className="bg-card p-5 rounded-xl">
    {/* Post Header */}
    <div className="flex items-center mb-4">
      <img
        src={post.user.avatar}
        alt={post.user.name}
        className="w-12 h-12 rounded-full mr-4"
      />
      <div>
        <p className="font-bold text-foreground">{post.user.name}</p>
        <p className="text-sm text-secondary-foreground">{post.time}</p>
      </div>
    </div>

    {/* Post Content */}
    <p className="text-foreground text-base mb-4">{post.content}</p>
    {post.image && (
      <img
        src={post.image}
        alt="Post image"
        className="mt-3 rounded-lg w-full object-cover max-h-96"
      />
    )}

    {/* Post Actions */}
    <div className="flex items-center justify-between text-secondary-foreground mt-4 pt-4 border-t border-border">
      <button className="flex items-center space-x-2 hover:text-destructive transition-colors duration-300 group">
        <Heart className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="font-semibold">{post.likes}</span>
      </button>
      <button className="flex items-center space-x-2 hover:text-info transition-colors duration-300 group">
        <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="font-semibold">{post.comments}</span>
      </button>
      <button className="flex items-center space-x-2 hover:text-success transition-colors duration-300 group">
        <Share2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
        <span className="font-semibold">Share</span>
      </button>
    </div>
  </div>
);

// A new Post Composer component
const PostComposer = () => (
    <div className="bg-card p-5 rounded-xl">
        <div className="flex items-start">
            <img src="/assets/Testimonial/michael-b.jpg" alt="Your avatar" className="w-12 h-12 rounded-full mr-4" />
            <textarea
              className="w-full p-3 bg-background border border-border focus:ring-primary focus:border-primary rounded-lg text-base text-foreground placeholder:text-secondary-foreground"
              placeholder="Share your progress or motivation..."
              rows={3}
            ></textarea>
        </div>
        <div className="flex justify-between items-center mt-3 pl-16">
            <div className="flex space-x-2">
                <button className="text-secondary-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <ImageIcon className="w-6 h-6" />
                </button>
                 <button className="text-secondary-foreground hover:text-primary p-2 rounded-full hover:bg-primary/10 transition-colors">
                    <Send className="w-6 h-6" />
                </button>
            </div>
            <button className="bg-primary text-primary-foreground font-bold py-2 px-6 rounded-full hover:bg-primary/90 transition-all duration-300 shadow-sm hover:shadow-md">
                Post
            </button>
        </div>
    </div>
);


const MainFeed = () => {
  const posts = [
    {
      user: { name: "Sarah J.", avatar: "/assets/Testimonial/sarah-j.jpg" },
      time: "2 hours ago",
      content: "Just finished a 5km run! Feeling great! My new personal best. The journey is tough but so rewarding. What's everyone's favorite post-run stretch?",
      image: "https://source.unsplash.com/random/800x600/?running,woman",
      likes: 28,
      comments: 7,
    },
    {
      user: { name: "David L.", avatar: "/assets/Testimonial/david-l.jpg" },
      time: "4 hours ago",
      content: "Meal prep for the week is done! Chicken, broccoli, and sweet potatoes. Keeping it simple and effective. 💪🍱 #mealprep #nutrition",
      image: "https://source.unsplash.com/random/800x600/?meal-prep,healthy",
      likes: 45,
      comments: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <PostComposer />
      {posts.map((post, index) => (
        <Post key={index} post={post} />
      ))}
    </div>
  );
};

export default MainFeed;