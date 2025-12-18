import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Button, Card, IconPlus, Tooltip, Alert, CloseButton } from "@heroui/react"
import { favouriteCatImage, fetchCatImages, voteCat, fetchVotes, type CatImage, deleteCatImage, fetchRandomCatImage } from "../api/cats"
import RandomCatCard from "../components/RandomCat"

export default function Home() {
  //State
  const [loading, setLoading] = useState<boolean>(true)
  const [catImages, setCatImages] = useState<CatImage[]>([])
  const [loaded, setLoaded] = useState(false);
  const [poppingHeart, setPoppingHeart] = useState<string | null>(null);
  const [alertVisible, setAlertVisible] = useState(true);
  const [selectedCat, setSelectedCat] = useState<CatImage | null>(null);
  const [alert, setAlert] = useState<{ message: string; type: "warning" | "success" } | null>(null)
  const [favouriteLoading, setFavouriteLoading] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [randomCat, setRandomCat] = useState<CatImage | null>(null)

  const location = useLocation()
  const navigate = useNavigate()
  const alertFromUpload = location.state?.alert;

  useEffect(() => {
    const loadCatsAndVotes = async () => {
      try {
        const [cats, votes] = await Promise.all([fetchCatImages(), fetchVotes()]);
        const voteMap = aggregateVotes(votes);

        const catsWithScores = cats.map(cat => ({
          ...cat,
          score: voteMap[cat.id] ?? 0
        }));

        setCatImages(catsWithScores);
        setLoaded(true);
      } catch (error) {
        console.error("Error loading cats or votes:", error);
        setLoadError("Failed to load cats. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadCatsAndVotes();
  }, []);

  useEffect(() => {
    if (loaded) {
      const newCat = location.state?.newCat as CatImage | undefined
      if (newCat) {
        setCatImages((prevCats) => [newCat, ...prevCats])
      }
    }
  }, [loaded, location.state]);

  useEffect(() => {
    if (alertFromUpload) {
      const timer = setTimeout(() => {
        setAlertVisible(false);
        navigate(location.pathname, { replace: true, state: {} });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alertFromUpload, navigate, location.pathname]);

  useEffect(() => {
    if (alert?.type === "success") {
      const timer = setTimeout(() => setAlert(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    const loadRandomCat = async () => {
      if (!catImages.length) {
        try {
          const random = await fetchRandomCatImage()
          setRandomCat(random)
        } catch (error) {
          console.error("Failed to fetch random cat:", error)
        }
      }
    }
    loadRandomCat()
  }, [catImages.length])

  const aggregateVotes = (votes: Array<{ image_id: string; value: number }>) => {
    const map: Record<string, number> = {};
    votes.forEach(vote => {
      if (!map[vote.image_id]) map[vote.image_id] = 0;
      map[vote.image_id] += vote.value;
    });
    return map;
  };

  const handleFavourite = async (cat: CatImage) => {
    if (favouriteLoading === cat.id) return;

    setFavouriteLoading(cat.id);
    setPoppingHeart(cat.id);
    setTimeout(() => setPoppingHeart(null), 300);

    const prevCats = catImages;
    try {
      const newFavouriteId = await favouriteCatImage(cat)
      setSelectedCat((prevCat) =>
        prevCat && prevCat.id === cat.id
          ? {
              ...prevCat,
              favourite: newFavouriteId ? { id: newFavouriteId } : undefined,
            }
          : prevCat
      )
      setCatImages((prevCats) =>
        prevCats.map((c) => 
          c.id === cat.id ? { ...c, favourite: newFavouriteId ? { id: newFavouriteId } : undefined } : c
        )
      )
      showAlert(
        newFavouriteId
          ? "Added to favourites successfully! 🎉"
          : "Removed from favourites 😿",
        "success"
      );
    } catch (error) {
      setCatImages(prevCats);
      console.error("Error favouriting cat image:", error)
      if (error instanceof Error) {
        showAlert(error.message, "warning")
      } else {
        showAlert(String(error) || "Failed to favourite cat image", "warning")
      }
    } finally {
      setFavouriteLoading(null);
    }
  };

  const handleVote = (cat: CatImage, upvote: boolean) => async () => {
    try {
      await voteCat(cat, upvote)
      setCatImages((prevCats) =>
        prevCats.map((c) =>
          c.id === cat.id ? { ...c, score: (c.score ?? 0) + (upvote ? 1 : -1) } : c
        )
      );
    } catch (error) {
      console.error("Error voting cat image:", error)
      if (error instanceof Error) {
        showAlert(error.message, "warning")
      } else {
        showAlert(String(error) || "Failed to vote on this image", "warning")
      }
    }
  };

  const handleDelete = async (cat: CatImage) => {
    setCatImages((prev) => prev.filter((c) => c.id !== cat.id));

    try {
      await deleteCatImage(cat)
      setCatImages((prevCats) => prevCats.filter((c) => c.id !== cat.id))
      showAlert("Deleted successfully! 🎉", "success")
    } catch (error) {
      console.error("Error deleting cat image:", error)
      if (error instanceof Error) {
        showAlert(error.message, "warning")
      } else {
        showAlert(String(error) || "Failed to delete cat image", "warning")
      }
    }
  }

  const showAlert = (message: string, type: "success" | "warning") => {
    setAlert({ message, type });
  }

  return ( 
    <div className="flex flex-col p-4 h-full">
      {alertFromUpload && alertVisible && (
        <div className="fixed top-4 right-4 z-50">
          <Alert status={alertFromUpload.type}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{alertFromUpload.message}</Alert.Title>
            </Alert.Content>
          </Alert>
        </div>
      )}
      {alert && (
        <div className="fixed top-4 right-4 z-50">
          <Alert status={alert.type}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{alert.message}</Alert.Title>
            </Alert.Content>
            {alert.type === "warning" && (
              <CloseButton onClick={() => setAlert(null)} />
            )}
          </Alert>
        </div>
      )}
      <h1 className="pb-5">✨ Welcome to the Cat App ✨</h1>
      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col gap-4 justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-400 border-solid "></div>
            <p className="text-gray-500">Loading cats...</p>
          </div>
        )}

        {!loading && !catImages.length && (
          <div className="flex flex-col justify-center items-center h-40">
            <p className="text-gray-500">No cat images found.</p>
            <p className="text-gray-500">Click "Upload a Cat" to get started 🤩</p>
          </div>
        )}

        {!loading && !catImages.length && randomCat && (
          <RandomCatCard
            cat={randomCat}
            onRefresh={async () => {
              const newCat = await fetchRandomCatImage()
              setRandomCat(newCat)
            }}
            context="home"
          />
        )}

        {loadError && (
          <div className="fixed top-4 right-4 z-50">
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{loadError}</Alert.Title>
              </Alert.Content>
              <CloseButton onClick={() => setLoadError(null)} />
            </Alert>
          </div>
        )}

        {!loading && catImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {catImages.map((cat) => (
              <div>
                <Card key={cat.id} className="relative aspect-square overflow-hidden">
                  <Tooltip delay={0}>
                    <Button 
                      isIconOnly 
                      onClick={() => handleDelete(cat)}
                      className="hidden sm:flex absolute top-2 right-2 z-20 bg-black/60 hover:bg-black text-white rounded-full p-1 transition cursor-pointer"
                      aria-label="Delete this cat"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" viewBox="0 0 24 24" 
                        strokeWidth={1.5} 
                        stroke="currentColor" 
                        className="size-5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </Button>
                    <Tooltip.Content>Delete this cat 😿</Tooltip.Content>
                  </Tooltip>

                  <img
                    alt={cat.breeds?.[0]?.name ?? "Cat"}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover cursor-pointer"
                    src={cat.url}
                    onClick={() => setSelectedCat(cat)}
                  />

                  <Card.Footer className="z-10 mt-auto flex items-end justify-between hidden sm:flex">
                    <Tooltip delay={0}>
                      <Button
                        variant="ghost"
                        isIconOnly
                        isDisabled={favouriteLoading === cat.id}
                        aria-label={cat.favourite?.id ? "Unfavourite this cat" : "Favourite this cat"}
                        className={`hover:bg-transparent transition-transform duration-200 ease-out ${poppingHeart === cat.id ? "scale-125" : "scale-100"}`}
                        onClick={() => handleFavourite(cat)}
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill={cat.favourite?.id ? "red" : "white"} 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke={cat.favourite?.id ? "red" : "white"}
                          className="size-8"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                      </Button>
                      <Tooltip.Content>{cat.favourite?.id ? "Unfavourite this cat" : "Favourite this cat"}</Tooltip.Content>
                    </Tooltip>
                    
                  </Card.Footer>
                </Card>
                <div className="flex items-center justify-center gap-3 mt-2 select-none">
                  <div className="cursor-pointer">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="flex items-center justify-center w-9 h-9 active:scale-90 transition"
                      onClick={handleVote(cat, true)}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                    </svg>
                  </div>
                  <div className="min-w-8 text-center text-lg font-semibold text-gray-800">
                    {cat.score ?? 0}
                  </div>
                  <div className="cursor-pointer">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="flex items-center justify-center w-9 h-9 active:scale-90 transition" 
                      onClick={handleVote(cat, false)}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCat && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setSelectedCat(null)}
          >
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 sm:hidden z-10">
                <Button
                  isIconOnly
                  variant="ghost"
                  onClick={() => handleFavourite(selectedCat)}
                  isDisabled={favouriteLoading === selectedCat.id}
                  className="text-white rounded-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={selectedCat.favourite?.id ? "red" : "white"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={selectedCat.favourite?.id ? "red" : "white"}
                    className="size-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </Button>

                <Button
                  isIconOnly
                  variant="ghost"
                  onClick={() => {
                    handleDelete(selectedCat)
                    setSelectedCat(null)
                  }}
                  className=" text-white rounded-full"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="size-8"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </Button>
              </div>
              <img
                src={selectedCat.url}
                alt={selectedCat.breeds?.[0]?.name ?? "Cat"}
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              />
              <Button
                variant="ghost"
                className="absolute top-2 right-2 text-white text-2xl font-bold bg-black/60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/70"
                onClick={(e) => { e.stopPropagation(); setSelectedCat(null); }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/upload')}
          variant="primary" 
          size="lg"
        >
          <IconPlus />
          Upload a Cat
        </Button>
      </div>
    </div>
  )
}