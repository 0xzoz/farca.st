import { useSendAction } from "@/client/hooks";
import { SelfContext } from "@/client/self";
import { ChangeEvent, useCallback, useContext, useState } from "react";
import { Button } from "./Button";
import { UserIcon } from "./UserIcon";
import { useEffect } from "react";
import { MAX_POST_LENGTH } from "@/common/constants";
import { Action, Post } from "@/common/model";
import { PostBox } from "./PostBox";
import { useRouter } from "next/router";

export function useComposeModal() {
  const [isOpen, setOpen] = useState(false);
  const showCompose = useCallback(() => setOpen(true), []);
  const hideCompose = useCallback(() => setOpen(false), []);

  const router = useRouter();
  const postSucceeded = useCallback(() => {
    setOpen(false);
    router.replace(router.asPath);
  }, [router]);

  return { isOpen, showCompose, hideCompose, postSucceeded };
}

export function ComposeScreen({
  onSuccess,
  replyTo,
}: {
  onSuccess: () => void;
  replyTo?: Post;
}) {
  // Compose box
  const focus = useCallback((el: HTMLTextAreaElement) => el?.focus(), []);
  const [text, setText] = useState("");
  const changeText = useCallback(
    (e: ChangeEvent<{ value: string }>) => setText(e.target.value),
    []
  );

  // Length limit
  const maxChars = MAX_POST_LENGTH;
  const charsLeft = maxChars - text.length;

  // Send button
  const [send, result] = useSendAction();
  const sendPost = useCallback(() => {
    if (charsLeft < 0 || text.trim() === "") return;
    const action: Action = { type: "post", content: text.trim() };
    if (replyTo) action.parentID = replyTo.id;
    send(action);
  }, [charsLeft, text, replyTo, send]);
  const sendDisabled = charsLeft < 0 || text.trim() === "" || result.isLoading;

  // Close on success
  useEffect(() => {
    if (result.isSuccess) onSuccess();
  }, [result.isSuccess, onSuccess]);

  const self = useContext(SelfContext);
  if (!self) throw new Error("unreachable");

  return (
    <>
      {replyTo && <PostBox post={replyTo} noButtons />}
      <div className="flex-grow flex gap-6 items-stretch">
        <div>
          <UserIcon big user={self.user} />
        </div>
        <div className="flex-grow flex flex-col">
          <textarea
            className="h-36 bg-transparent text-white border-none outline-none resize-none"
            placeholder="What's happening?"
            value={text}
            onChange={changeText}
            ref={focus}
          />
          <div className="flex justify-between items-baseline">
            <span className={charsLeft < 0 ? "text-error" : "text-gray"}>
              {charsLeft}/{maxChars}
            </span>
            <Button disabled={sendDisabled} onClick={sendPost}>
              Send
            </Button>
          </div>
          {result.error && (
            <div className="text-error">{result.error.message}</div>
          )}
        </div>
      </div>
    </>
  );
}
