export default function About() {
  return (
    <main className="flex items-center justify-center h-[90vh]">
      <div className=" flex flex-col gap-8 text-center">
        <p className="text-4xl font-semibold">
          Developed by Robin Sao - 21905099
        </p>
        <p>
          Below is a video walkthrough on how to use it. You can turn on
          subtitles if you find it hard to listen
        </p>
        <video
          controls
          autoPlay
          className="w-[60vw] min-w-80 min-h-96 h-[60vh] rounded-lg mx-auto"
        >
          <source src="/video-walkthrough.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </main>
  );
}
