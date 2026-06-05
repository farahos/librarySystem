import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, Eye, Heart, ListPlus, MessageCircle, Plus, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiClient, authorProfilePath, formatCount, storyAuthor, storyCover } from "../lib/apiClient";
import { useUser } from "../hooks/useUser.jsx";
import { Avatar } from "./UserProfile.jsx";

const PostDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const commentsRef = useRef(null);
  const { user, isAdmin } = useUser();
  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [selectedChapterNumber, setSelectedChapterNumber] = useState("");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [listModalOpen, setListModalOpen] = useState(false);
  const [readingLists, setReadingLists] = useState([]);
  const [listsLoading, setListsLoading] = useState(false);
  const [newListName, setNewListName] = useState("");

  const token = localStorage.getItem("token");
  const currentUserId = user?.id || user?._id;
  const storyOwnerId = story?.authorId?._id || story?.authorId?.id || story?.authorId;
  const canManageStory = Boolean(currentUserId && storyOwnerId && (String(currentUserId) === String(storyOwnerId) || isAdmin));

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/stories/${slug}`)
      .then(({ data }) => {
        const loadedChapters = data.chapters || [];
        setStory(data.story);
        setChapters(loadedChapters);
        const firstChapter = loadedChapters[0] || null;
        setActiveChapter(firstChapter);
        setSelectedChapterNumber(firstChapter?.chapterNumber ? String(firstChapter.chapterNumber) : "");
      })
      .catch((err) => {
        console.error(err.response?.data || err);
        setStory(null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!story?._id || !selectedChapterNumber) return;

    setChapterLoading(true);
    apiClient
      .get(`/stories/${story._id}/chapters/${selectedChapterNumber}`)
      .then(({ data }) => setActiveChapter(data.chapter))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load chapter"))
      .finally(() => setChapterLoading(false));
  }, [story?._id, selectedChapterNumber]);

  useEffect(() => {
    if (!story?._id || !canManageStory) return;

    apiClient
      .get(`/stories/${story._id}/chapters`, { params: { includeDrafts: true } })
      .then(({ data }) => {
        const ownerChapters = data.chapters || [];
        setChapters(ownerChapters);
        if (!selectedChapterNumber && ownerChapters[0]) {
          setSelectedChapterNumber(String(ownerChapters[0].chapterNumber));
        }
      })
      .catch(() => {});
  }, [story?._id, canManageStory, selectedChapterNumber]);

  useEffect(() => {
    if (!activeChapter?._id) {
      setComments([]);
      return;
    }
    apiClient
      .get(`/chapters/${activeChapter._id}/comments`)
      .then(({ data }) => setComments(data.comments || []))
      .catch(() => setComments([]));
  }, [activeChapter?._id]);

  const recordInteraction = async (action) => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      const { data } = await apiClient.post(`/stories/${story._id}/interactions`, { action });
      setStory((current) => ({ ...current, metrics: data.metrics }));
      toast.success(`${action} saved`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Could not ${action}`);
    }
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openListModal = async () => {
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    setListModalOpen(true);
    setListsLoading(true);
    try {
      const { data } = await apiClient.get("/reading-lists");
      setReadingLists(data.lists || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not load reading lists");
    } finally {
      setListsLoading(false);
    }
  };

  const addToList = async (listId) => {
    try {
      await apiClient.post(`/reading-lists/${listId}/stories`, { storyId: story._id });
      toast.success("Story added to reading list");
      setListModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add story to list");
    }
  };

  const createListAndAdd = async (event) => {
    event.preventDefault();
    if (!newListName.trim()) return toast.error("List name is required");
    try {
      const { data } = await apiClient.post("/reading-lists", { name: newListName, isPublic: true });
      await apiClient.post(`/reading-lists/${data.list._id}/stories`, { storyId: story._id });
      setReadingLists((current) => [data.list, ...current]);
      setNewListName("");
      setListModalOpen(false);
      toast.success("Reading list created");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create reading list");
    }
  };

  const addComment = async (event) => {
    event.preventDefault();
    if (!token) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    if (!activeChapter?._id) return toast.error("Select a chapter first");
    if (!commentText.trim()) return;
    try {
      const { data } = await apiClient.post(`/chapters/${activeChapter._id}/comments`, {
        content: commentText,
      });
      setComments((current) => [data.comment, ...current]);
      setCommentText("");
      setStory((current) => ({
        ...current,
        metrics: { ...current.metrics, comments: (current.metrics?.comments || 0) + 1 },
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add comment");
    }
  };

  const deleteStory = async () => {
    if (!canManageStory || !story?._id) return;
    const confirmed = window.confirm("Archive this story?");
    if (!confirmed) return;

    setDeleting(true);
    try {
      await apiClient.delete(`/stories/${story._id}`);
      toast.success("Story archived");
      navigate("/viewbook");
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Loading story...</main>;
  if (!story) return <main className="min-h-screen bg-gray-50 p-8 text-gray-500">Story not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative bg-gray-950 text-white">
        <img src={storyCover(story)} alt={story.title} className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-[260px_1fr]">
          <img src={storyCover(story)} alt={story.title} className="aspect-[2/3] w-full rounded-lg object-cover shadow-2xl" />
          <div className="flex flex-col justify-end">
            <p className="text-sm font-black uppercase tracking-wide text-orange-300">Madal Story</p>
            <h1 className="mt-3 text-5xl font-black">{story.title}</h1>
            <Link to={authorProfilePath(story)} className="mt-3 w-fit text-lg font-semibold text-gray-200 hover:text-orange-200">
              {storyAuthor(story)}
            </Link>
            <span className="mt-4 inline-flex w-fit rounded-full bg-orange-600 px-3 py-1 text-sm font-black capitalize text-white">
              {story.category || "drama"}
            </span>
            <p className="mt-5 max-w-3xl leading-7 text-gray-100">{story.description}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
              <Metric icon={Eye} value={story.metrics?.views || 0} label="Views" />
              <Metric icon={BookOpen} value={story.metrics?.reads || 0} label="Reads" />
              <Metric icon={Heart} value={story.metrics?.likes || 0} label="Likes" />
              <Metric icon={MessageCircle} value={story.metrics?.comments || 0} label="Comments" />
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => recordInteraction("like")} className="rounded-lg bg-orange-600 px-4 py-2 font-black hover:bg-orange-700">
                Like
              </button>
              <button onClick={scrollToComments} className="rounded-lg bg-white px-4 py-2 font-black text-gray-950 hover:bg-orange-50">
                Comment
              </button>
              <button
                onClick={openListModal}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-black text-gray-950 hover:bg-orange-50"
              >
                <ListPlus size={18} />
                Add to List
              </button>
              {canManageStory && (
                <>
                  <button
                    onClick={() => navigate(`/story/${story._id}/manage`)}
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-black text-gray-950 hover:bg-orange-50"
                  >
                    <Plus size={18} />
                    Manage Story
                  </button>
                  <button
                    onClick={deleteStory}
                    disabled={deleting}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-black text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={18} />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black text-gray-950">Chapters</h2>
            <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-black text-orange-700">{chapters.length}</span>
          </div>

          <label className="mt-4 block text-sm font-bold text-gray-700">
            Select chapter
            <select
              value={selectedChapterNumber}
              onChange={(event) => setSelectedChapterNumber(event.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
            >
              {chapters.map((chapter) => (
                <option key={chapter._id} value={chapter.chapterNumber}>
                  {chapter.chapterNumber}. {chapter.title}{chapter.status === "draft" ? " (draft)" : ""}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 space-y-2">
            {chapters.map((chapter) => (
              <button
                key={chapter._id}
                onClick={() => setSelectedChapterNumber(String(chapter.chapterNumber))}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm font-bold ${
                  String(selectedChapterNumber) === String(chapter.chapterNumber)
                    ? "bg-orange-600 text-white"
                    : "bg-gray-50 text-gray-700 hover:bg-orange-50"
                }`}
              >
                {chapter.chapterNumber}. {chapter.title}{chapter.status === "draft" ? " (draft)" : ""}
              </button>
            ))}
          </div>
        </aside>

        <article className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {activeChapter ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-orange-600">Chapter {activeChapter.chapterNumber}</p>
                  <h2 className="mt-1 text-3xl font-black text-gray-950">{activeChapter.title}</h2>
                </div>
                <a
                  href={`/read/${story._id}/${activeChapter.chapterNumber}`}
                  className="inline-flex rounded-lg bg-orange-600 px-4 py-2 font-black text-white hover:bg-orange-700"
                >
                  Open Reader Mode
                </a>
              </div>

              {chapterLoading ? (
                <p className="mt-8 text-gray-500">Loading chapter...</p>
              ) : (
                <div className="mt-8 whitespace-pre-line text-lg leading-9 text-gray-800">{activeChapter.content}</div>
              )}

              <div ref={commentsRef} className="mt-10 scroll-mt-24 border-t border-gray-100 pt-6">
                <h3 className="text-xl font-black text-gray-950">Chapter Comments</h3>
                <form onSubmit={addComment} className="mt-4 flex gap-3">
                  <input
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Write a comment for this chapter..."
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
                  />
                  <button className="rounded-lg bg-orange-600 px-4 py-2 font-black text-white">Post</button>
                </form>
                <div className="mt-5 space-y-3">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 rounded-lg bg-gray-50 p-3">
                      <Avatar profile={comment.authorId} />
                      <div>
                        {comment.authorId?.username ? (
                          <Link to={authorProfilePath(comment.authorId)} className="font-bold text-gray-900 hover:text-orange-700">
                            {comment.authorId?.displayName || comment.authorId?.username}
                          </Link>
                        ) : (
                          <p className="font-bold text-gray-900">Reader</p>
                        )}
                        <p className="mt-1 text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-gray-500">No comments yet for this chapter.</p>}
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No published chapters yet.</p>
          )}
        </article>
      </section>

      {listModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-orange-600">Library</p>
                <h2 className="text-2xl font-black text-gray-950">Add to Reading List</h2>
              </div>
              <button onClick={() => setListModalOpen(false)} className="rounded-lg bg-gray-100 px-3 py-2 font-black text-gray-700 hover:bg-gray-200">
                Close
              </button>
            </div>

            <form onSubmit={createListAndAdd} className="mt-5 flex gap-2">
              <input
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                placeholder="Create new list"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-3 outline-none focus:border-orange-500"
              />
              <button className="rounded-lg bg-orange-600 px-4 py-2 font-black text-white hover:bg-orange-700">Create</button>
            </form>

            <div className="mt-5 max-h-80 space-y-2 overflow-y-auto">
              {listsLoading ? (
                <p className="rounded-lg bg-gray-50 p-4 text-gray-500">Loading lists...</p>
              ) : readingLists.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-4 text-gray-500">No reading lists yet. Create one above.</p>
              ) : (
                readingLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => addToList(list._id)}
                    className="w-full rounded-lg border border-gray-200 p-4 text-left hover:border-orange-200 hover:bg-orange-50"
                  >
                    <span className="block font-black text-gray-950">{list.name}</span>
                    <span className="mt-1 block text-sm text-gray-500">{list.isPublic ? "Public" : "Private"} list</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

function Metric({ icon: Icon, value, label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
      <Icon size={16} />
      {formatCount(value)} {label}
    </span>
  );
}

export default PostDetail;
