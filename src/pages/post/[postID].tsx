import { SelfContext } from "../../client/self";
import { useSigningKey } from "../../common/crypto";
import { Thread, User } from "../../common/model";
import { FeedScreen } from "../../components/FeedScreen";
import { server, feed } from "../../server";
import { GetServerSideProps, Redirect } from "next";

interface PostPageProps {
  user: User;
  postID: number;
  thread: Thread;
}

/** Shows a single post, with surrounding thread if applicable. */
export default function PostPage({ user, thread, postID }: PostPageProps) {
  const signingKey = useSigningKey();
  if (user == null || signingKey == null) return null;

  return (
    <SelfContext.Provider value={{ user, signingKey }}>
      <FeedScreen threads={[thread]} feed={{ type: "thread", postID }} />
    </SelfContext.Provider>
  );
}

export const getServerSideProps: GetServerSideProps<PostPageProps> = async (
  context
) => {
  // Authenticate
  const user = await server.authenticateRequest(context.req);
  if (user == null) return { redirect: { destination: "/" } as Redirect };

  // Validate inputs
  const postID = Number(context.query.postID);
  if (!Number.isInteger(postID)) throw new Error("Invalid postID");
  const post = feed.loadPost(user.uid, postID);
  if (post == null) throw new Error("Post not found");

  // Load data
  const thread = feed.loadThread(user.uid, post.id);

  return { props: { user, thread, postID } };
};
