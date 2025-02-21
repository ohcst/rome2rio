const fetchPlaylistTracks = async (accessToken, playlistId) => {
		try {
			const response = await axios.get(
				`https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);
			if (response.data && response.data.items) {
				const trackDetails = response.data.items
					.map((item) => ({
						id: item.track.id,
						name: item.track.name,
						artist: item.track.artists
							.map((artist) => artist.name)
							.join(", "),
						artistId: item.track.artists[0]?.id,
						albumName: item.track.album.name,
						albumId: item.track.album.id,
						image: item.track.album.images[0].url,
						previewUrl: item.track.preview_url,
					}))
					.filter((item) => item.previewUrl);

				for (let i = trackDetails.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[trackDetails[i], trackDetails[j]] = [
						trackDetails[j],
						trackDetails[i],
					];
				}
				//console.log(trackDetails);
				setTracks(trackDetails);
				setCurrentTrackIndex(0);
			} else {
				throw new Error("No tracks found in playlist");
			}
		} catch (err) {
			//console.error("Error fetching playlist tracks:", err);
			setError(true);
			setAudioPlaying(true);
		}
	};

	useEffect(() => {
		const fetchAccessToken = async () => {
			try {
				const response = await axios.get(
					"https://styr.gg/api/spotify.php"
				);
				if (response.data.access_token) {
					return response.data.access_token;
				} else {
					throw new Error("Access token not found in response");
				}
			} catch (err) {
				//console.error("Error fetching access token:", err);
				setError(true);
				setAudioPlaying(true);
				return null;
			}
		};

		fetchAccessToken().then((accessToken) => {
			if (accessToken) {
				const updatePlaylistInfo = async (accessToken) => {
					try {
						const updatedPlaylists = await Promise.all(
							playlists.map(async (playlist) => {
								const response = await axios.get(
									`https://api.spotify.com/v1/playlists/${playlist.id}`,
									{
										headers: {
											Authorization: `Bearer ${accessToken}`,
										},
									}
								);
								return {
									...playlist,
									name: response.data.name,
								};
							})
						);
						//console.log(updatedPlaylists);
						setPlaylists(updatedPlaylists);
					} catch (err) {
						//console.error("Error fetching playlist information:",err);
					}
				};

				updatePlaylistInfo(accessToken);
				fetchPlaylistTracks(accessToken, selectedPlaylist);
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPlaylist]);
