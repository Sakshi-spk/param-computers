const WISHLIST_STORAGE_KEY = "wishlist";

export const WISHLIST_UPDATED_EVENT =
  "wishlistUpdated";

/*
 * Get all wishlist product IDs.
 */
export function getWishlistIds() {
  try {
    const stored = localStorage.getItem(
      WISHLIST_STORAGE_KEY
    );

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    /*
     * Normalize every ID to String.
     *
     * This is important because Supabase IDs
     * may come as numbers while localStorage
     * may contain strings.
     */
    return parsed
      .map((id) => String(id))
      .filter(Boolean);
  } catch (error) {
    console.error(
      "Error reading wishlist:",
      error
    );

    return [];
  }
}

/*
 * Save wishlist IDs to localStorage.
 */
function saveWishlistIds(ids) {
  const cleanIds = [
    ...new Set(
      ids
        .map((id) => String(id))
        .filter(Boolean)
    ),
  ];

  localStorage.setItem(
    WISHLIST_STORAGE_KEY,
    JSON.stringify(cleanIds)
  );

  return cleanIds;
}

/*
 * Check whether a product is currently
 * in the wishlist.
 */
export function isWishlisted(productId) {
  if (
    productId === null ||
    productId === undefined
  ) {
    return false;
  }

  const id = String(productId);

  const ids = getWishlistIds();

  return ids.includes(id);
}

/*
 * Dispatch one common wishlist event.
 *
 * Every page/component can listen to this.
 */
function dispatchWishlistEvent(
  productId,
  wishlisted,
  ids
) {
  window.dispatchEvent(
    new CustomEvent(
      WISHLIST_UPDATED_EVENT,
      {
        detail: {
          productId:
            productId !== null &&
            productId !== undefined
              ? String(productId)
              : null,

          wishlisted: Boolean(
            wishlisted
          ),

          ids: ids || getWishlistIds(),

          count:
            ids?.length ??
            getWishlistIds().length,
        },
      }
    )
  );
}

/*
 * Add/remove product from wishlist.
 *
 * This is the ONLY function that should
 * normally be used for the heart button.
 */
export function toggleWishlist(
  productId
) {
  if (
    productId === null ||
    productId === undefined
  ) {
    return {
      ids: getWishlistIds(),
      wishlisted: false,
    };
  }

  const id = String(productId);

  const currentIds =
    getWishlistIds();

  const alreadyWishlisted =
    currentIds.includes(id);

  let newIds;

  let wishlisted;

  if (alreadyWishlisted) {
    /*
     * REMOVE
     */
    newIds = currentIds.filter(
      (wishlistId) =>
        String(wishlistId) !== id
    );

    wishlisted = false;
  } else {
    /*
     * ADD
     */
    newIds = [
      ...currentIds,
      id,
    ];

    wishlisted = true;
  }

  const savedIds =
    saveWishlistIds(newIds);

  /*
   * Tell every component/page that
   * the wishlist changed.
   */
  dispatchWishlistEvent(
    id,
    wishlisted,
    savedIds
  );

  return {
    ids: savedIds,
    wishlisted,
  };
}

/*
 * Explicitly add a product.
 *
 * Useful when you want to guarantee that
 * a product becomes wishlisted without
 * accidentally removing it.
 */
export function addToWishlist(
  productId
) {
  if (
    productId === null ||
    productId === undefined
  ) {
    return {
      ids: getWishlistIds(),
      wishlisted: false,
    };
  }

  const id = String(productId);

  const currentIds =
    getWishlistIds();

  if (currentIds.includes(id)) {
    return {
      ids: currentIds,
      wishlisted: true,
    };
  }

  const newIds = [
    ...currentIds,
    id,
  ];

  const savedIds =
    saveWishlistIds(newIds);

  dispatchWishlistEvent(
    id,
    true,
    savedIds
  );

  return {
    ids: savedIds,
    wishlisted: true,
  };
}

/*
 * Explicitly remove a product.
 */
export function removeFromWishlist(
  productId
) {
  if (
    productId === null ||
    productId === undefined
  ) {
    return {
      ids: getWishlistIds(),
      wishlisted: false,
    };
  }

  const id = String(productId);

  const currentIds =
    getWishlistIds();

  const newIds =
    currentIds.filter(
      (wishlistId) =>
        String(wishlistId) !== id
    );

  const savedIds =
    saveWishlistIds(newIds);

  dispatchWishlistEvent(
    id,
    false,
    savedIds
  );

  return {
    ids: savedIds,
    wishlisted: false,
  };
}

/*
 * Clear the complete wishlist.
 */
export function clearWishlist() {
  const currentIds =
    getWishlistIds();

  localStorage.removeItem(
    WISHLIST_STORAGE_KEY
  );

  dispatchWishlistEvent(
    null,
    false,
    []
  );

  return {
    ids: [],
    wishlisted: false,
    removedIds: currentIds,
  };
}

/*
 * Get wishlist count.
 */
export function getWishlistCount() {
  return getWishlistIds().length;
}