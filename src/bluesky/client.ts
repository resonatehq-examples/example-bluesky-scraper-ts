import { AtpAgent } from "@atproto/api";

export interface ProfileData {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
}

export interface FollowerRelation {
  did: string;
  handle: string;
  displayName?: string;
  createdAt?: string;
}

export interface FollowersPage {
  followers: FollowerRelation[];
  cursor?: string;
}

const PUBLIC_API = "https://public.api.bsky.app";
const DELAY_BETWEEN_REQUESTS_MS = 500;
const MAX_FOLLOWERS_PER_PAGE = 50;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProfile(actor: string): Promise<ProfileData> {
  const agent = new AtpAgent({ service: PUBLIC_API });
  const response = await agent.getProfile({ actor });

  return {
    did: response.data.did,
    handle: response.data.handle,
    displayName: response.data.displayName,
    description: response.data.description,
    avatar: response.data.avatar,
    followersCount: response.data.followersCount,
    followsCount: response.data.followsCount,
    postsCount: response.data.postsCount,
    indexedAt: response.data.indexedAt,
  };
}

export async function getFollowersPage(
  actor: string,
  cursor?: string,
): Promise<FollowersPage> {
  const agent = new AtpAgent({ service: PUBLIC_API });

  await delay(DELAY_BETWEEN_REQUESTS_MS);

  const response = await agent.getFollowers({
    actor,
    limit: MAX_FOLLOWERS_PER_PAGE,
    cursor,
  });

  const followers = response.data.followers.map((f) => ({
    did: f.did,
    handle: f.handle,
    displayName: f.displayName,
    createdAt: f.createdAt,
  }));

  return {
    followers,
    cursor: response.data.cursor,
  };
}
