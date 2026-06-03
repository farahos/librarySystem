import React from "react";
import { BadgeCheck, BookOpen, Eye, Headphones, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { authorProfilePath, formatCount, storyAuthor, storyCover, storySummary } from "../lib/apiClient";

export default function StoryCard({ story }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <Link to={`/story/${story.slug}`} className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={storyCover(story)}
          alt={story.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {story.original?.enabled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 px-2 py-1 text-xs font-bold text-white">
              <BadgeCheck size={12} />
              Original
            </span>
          )}
          {story.audio?.url && (
            <span className="rounded-full bg-black/70 p-1.5 text-white">
              <Headphones size={14} />
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/story/${story.slug}`} className="line-clamp-2 text-lg font-black text-gray-950 group-hover:text-orange-700">
          {story.title}
        </Link>
        <Link to={authorProfilePath(story)} className="mt-1 w-fit text-sm font-semibold text-gray-500 hover:text-orange-700">
          {storyAuthor(story)}
        </Link>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-gray-600">{storySummary(story)}</p>

        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs font-bold text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Eye size={14} />
            {formatCount(story.metrics?.views || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <BookOpen size={14} />
            {formatCount(story.metrics?.reads || 0)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={14} />
            {formatCount(story.metrics?.likes || 0)}
          </span>
          <span className="ml-auto rounded-full bg-orange-50 px-2 py-1 text-orange-700 capitalize">
            {story.status || "ongoing"}
          </span>
        </div>
        <p className="mt-2 w-fit rounded-full bg-gray-50 px-2 py-1 text-xs font-bold capitalize text-gray-600">{story.category || "drama"}</p>
      </div>
    </article>
  );
}
