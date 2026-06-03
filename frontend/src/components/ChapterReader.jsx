import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Minus, Plus } from "lucide-react";
import { apiClient, authorProfilePath, storyAuthor } from "../lib/apiClient";
import AudioPlayer from "./AudioPlayer";
import { Avatar } from "./UserProfile";

export default function ChapterReader() {
  const { storyId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsRef = useRef(null);
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [fontSize, setFontSize] = useState(19);
  const [dark, setDark] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    setError("");
    setData(null);
    apiClient
      .get(`/stories/${storyId}/chapters/${chapterNumber}/reader`)
      .then(({ data }) => setData(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load chapter"));
  }, [storyId, chapterNumber]);

  useEffect(() => {
    if (!data?.chapter?._id) {
      setComments([]);
      return;
    }

    apiClient
      .get(`/chapters/${data.chapter._id}/comments`)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => setComments([]));
  }, [data?.chapter?._id]);

  useEffect(() => {
    if (data?.chapter?._id && location.hash === "#comments") {
      window.setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [data?.chapter?._id, location.hash]);

  const addComment = async (event) => {
    event.preventDefault();
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!commentText.trim()) return;

    try {
      const { data: response } = await apiClient.post(`/chapters/${data.chapter._id}/comments`, {
        content: commentText,
      });
      setComments((current) => [response.comment, ...current]);
      setCommentText("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add comment");
    }
  };

  if (error) return <main className="min-h-screen bg-gray-50 p-8 text-red-700">{error}</main>;
  if (!data) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading chapter...</main>;

  const { story, chapter, chapters = [], previousChapter, nextChapter } = data;

  return (
    <main className={dark ? "min-h-screen bg-[#111] text-gray-100" : "min-h-screen bg-orange-50 text-gray-950"}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to={`/story/${story.slug}`} className="font-bold text-orange-700">Back to story</Link>
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize((value) => Math.max(16, value - 1))} className="rounded-lg border px-3 py-2">
              <Minus size={16} />
            </button>
            <button onClick={() => setFontSize((value) => Math.min(28, value + 1))} className="rounded-lg border px-3 py-2">
              <Plus size={16} />
            </button>
            <button onClick={() => setDark((value) => !value)} className="rounded-lg bg-orange-600 px-3 py-2 font-bold text-white">
              {dark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        <article className={dark ? "rounded-lg bg-[#181818] p-6" : "rounded-lg bg-white p-6 shadow-sm"}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-orange-600">{story.title}</p>
              <h1 className="mt-2 text-4xl font-black">{chapter.title}</h1>
              <Link to={authorProfilePath(story)} className="mt-2 inline-flex font-semibold text-gray-500 hover:text-orange-700">
                {storyAuthor(story)}
              </Link>
            </div>
            <label className="block min-w-56 text-sm font-bold text-gray-500">
              Chapter
              <select
                value={chapter.chapterNumber}
                onChange={(event) => navigate(`/read/${story._id}/${event.target.value}`)}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-3 text-gray-950 outline-none focus:border-orange-500"
              >
                {chapters.map((item) => (
                  <option key={item._id} value={item.chapterNumber}>
                    {item.chapterNumber}. {item.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {chapter.audio?.url && (
            <div className="mt-6 rounded-lg bg-orange-100 p-4">
              <AudioPlayer src={chapter.audio.url} />
            </div>
          )}
          <div className="mt-8 whitespace-pre-line leading-9" style={{ fontSize }}>
            {chapter.content}
          </div>
        </article>

        <div className="mt-6 flex justify-between gap-3">
          {previousChapter ? (
            <Link className="rounded-lg bg-white px-4 py-3 font-bold shadow-sm" to={`/read/${story._id}/${previousChapter.chapterNumber}`}>
              Previous Chapter
            </Link>
          ) : <span />}
          {nextChapter ? (
            <Link className="rounded-lg bg-orange-600 px-4 py-3 font-bold text-white" to={`/read/${story._id}/${nextChapter.chapterNumber}`}>
              Next Chapter
            </Link>
          ) : <span />}
        </div>

        <section
          id="comments"
          ref={commentsRef}
          className={dark ? "mt-8 scroll-mt-24 rounded-lg bg-[#181818] p-6" : "mt-8 scroll-mt-24 rounded-lg bg-white p-6 shadow-sm"}
        >
          <h2 className="text-2xl font-black">Chapter Comments</h2>
          <form onSubmit={addComment} className="mt-4 flex gap-3">
            <input
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              placeholder="Write a comment for this chapter..."
              className="flex-1 rounded-lg border border-gray-200 px-3 py-3 text-gray-950 outline-none focus:border-orange-500"
            />
            <button className="rounded-lg bg-orange-600 px-4 py-2 font-black text-white">Post</button>
          </form>
          <div className="mt-5 space-y-3">
            {comments.map((comment) => (
              <div key={comment._id} className={`flex gap-3 ${dark ? "rounded-lg bg-[#222] p-3" : "rounded-lg bg-gray-50 p-3"}`}>
                <Avatar profile={comment.authorId} />
                <div>
                  {comment.authorId?.username ? (
                    <Link to={authorProfilePath(comment.authorId)} className="font-bold hover:text-orange-600">
                      {comment.authorId?.displayName || comment.authorId?.username}
                    </Link>
                  ) : (
                    <p className="font-bold">Reader</p>
                  )}
                  <p className="mt-1 opacity-80">{comment.content}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && <p className="text-gray-500">No comments yet for this chapter.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
