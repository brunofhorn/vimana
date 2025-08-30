-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tags" JSONB,
    "is_repost" BOOLEAN NOT NULL DEFAULT false,
    "is_sponsored" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "video_id" TEXT NOT NULL,
    "socialnetwork_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "posted_at" DATETIME NOT NULL,
    CONSTRAINT "VideoLink_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "Video" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VideoLink_socialnetwork_id_fkey" FOREIGN KEY ("socialnetwork_id") REFERENCES "SocialNetworks" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VideoLink_video_id_idx" ON "VideoLink"("video_id");

-- CreateIndex
CREATE INDEX "VideoLink_socialnetwork_id_idx" ON "VideoLink"("socialnetwork_id");

-- CreateIndex
CREATE UNIQUE INDEX "VideoLink_video_id_socialnetwork_id_key" ON "VideoLink"("video_id", "socialnetwork_id");
