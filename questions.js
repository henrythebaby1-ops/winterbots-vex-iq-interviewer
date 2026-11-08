// WinterBots VEX IQ AI Interviewer — question bank
// Difficulty: e = easy, m = medium, h = hard
// Categories are modeled on the kinds of things VEX IQ judges look for in a team interview.

window.CATEGORIES = [
  {
    id: "intro", name: "Team Introduction", icon: "👋",
    desc: "Warm-up questions judges use to get to know your team.",
    lookFor: ["Every team member speaks", "Clear roles and ownership", "Enthusiasm and confidence"],
    q: [
      ["e", "Can each of you introduce yourself and tell me your role on the team?"],
      ["e", "How did your team get started, and how long have you been doing VEX IQ?"],
      ["e", "What is your team number, and what does your team name mean?"],
      ["e", "What's your favorite part of being on a robotics team?"],
      ["e", "Can you give me a quick 30-second tour of your robot?"],
      ["e", "Is this anyone's first year? What has surprised you most about VEX IQ?"],
      ["m", "What is one thing your team is really proud of this season?"],
      ["m", "How often does your team meet, and what does a typical meeting look like?"],
      ["m", "What was each person's biggest contribution to the robot this season?"],
      ["m", "If you had to describe your team in three words, what would they be and why?"],
      ["m", "How did you decide who does what on your team?"],
      ["h", "What makes your team different from the other teams at this event?"]
    ]
  },
  {
    id: "edp", name: "Engineering Design Process", icon: "🔁",
    desc: "How you identify problems, brainstorm, build, test, and improve.",
    lookFor: ["Names the steps of the design process", "Real examples from this season", "Explains decisions with reasons and data"],
    q: [
      ["e", "What is the engineering design process, and how did your team use it this season?"],
      ["e", "What problem was your robot designed to solve?"],
      ["m", "How did you brainstorm ideas for your robot? How many ideas did you come up with?"],
      ["m", "How did you choose which design idea to build? Did you use a decision matrix or something else?"],
      ["m", "Tell me about a design you tried that did not work. What did you learn from it?"],
      ["m", "Walk me through one full cycle of the design process for a single part of your robot."],
      ["m", "Did you build any prototypes before your final robot? What did they teach you?"],
      ["m", "How many versions of your robot have you built, and what changed each time?"],
      ["m", "How did you set goals for your robot at the start of the season?"],
      ["m", "Did you look at other teams' robots or videos for ideas? How did you make the idea your own?"],
      ["h", "How do you know your current design is better than your earlier versions? What evidence do you have?"],
      ["h", "What constraints did you have to design around, like size, motor count, or time?"],
      ["h", "If you started the season over, what would you do differently in your design process?"],
      ["h", "What tradeoffs did you make in your design? What did you give up to get something else?"]
    ]
  },
  {
    id: "notebook", name: "Engineering Notebook", icon: "📓",
    desc: "How your team documents its journey, decisions, and data.",
    lookFor: ["Organized, dated entries", "Shows WHY decisions were made", "Testing data, sketches, and goals"],
    q: [
      ["e", "Can you show me your engineering notebook and explain how it is organized?"],
      ["e", "Who writes in your engineering notebook, and how often?"],
      ["e", "Do you use a paper notebook or a digital one? Why did you choose that?"],
      ["m", "What kinds of things do you record in your notebook?"],
      ["m", "Can you show me a page where you documented a problem and how you fixed it?"],
      ["m", "How do you record your testing results in the notebook?"],
      ["m", "Does your notebook have sketches or diagrams? How do they help you?"],
      ["m", "How do you make sure every team member's ideas get recorded in the notebook?"],
      ["m", "Do you date and sign your entries? Why does that matter?"],
      ["m", "How do you keep track of tasks and goals in your notebook?"],
      ["h", "How could a brand-new team member use your notebook to rebuild your robot?"],
      ["h", "Show me where your notebook explains WHY you made a big decision, not just what you did."],
      ["h", "What is the most useful page in your notebook, and why?"]
    ]
  },
  {
    id: "strategy", name: "Game Strategy", icon: "🎯",
    desc: "How well you understand the game and plan to score.",
    lookFor: ["Knows the rules and scoring", "Strategy backed by analysis", "Adapts to alliance partners"],
    q: [
      ["e", "Can you explain how this season's game is played and how you score points?"],
      ["e", "What is your robot's main job during a match?"],
      ["m", "How did you analyze the game before you started building?"],
      ["m", "What scoring strategy gives you the most points, and how did you figure that out?"],
      ["m", "How does your strategy change depending on your alliance partner's robot?"],
      ["m", "How do you plan the order of tasks in a 60-second teamwork match?"],
      ["m", "What is your strategy for the last few seconds of a match?"],
      ["m", "What does your robot do better than most other robots here?"],
      ["m", "How do you decide what to focus on in Driver Skills versus Autonomous Coding Skills?"],
      ["m", "How do you use scouting or watching other teams to improve your strategy?"],
      ["h", "Did you calculate the maximum possible score? How close can your robot get?"],
      ["h", "How did your strategy change from your first competition to now?"],
      ["h", "What's a weakness of your robot in this game, and how does your strategy work around it?"],
      ["h", "If the game had no time limit, would your strategy change? Why?"]
    ]
  },
  {
    id: "design", name: "Robot Design", icon: "🤖",
    desc: "Your mechanisms, drivetrain, gearing, and design reasoning.",
    lookFor: ["Explains each subsystem", "Understands speed vs. torque", "Reasons for design choices"],
    q: [
      ["e", "What are the main parts, or subsystems, of your robot?"],
      ["e", "What kind of drivetrain does your robot use, and why did you choose it?"],
      ["m", "How does your robot pick up or control game pieces?"],
      ["m", "How many motors does your robot use, and what does each one do?"],
      ["m", "What gear ratios did you use, and why? Did you want more speed or more torque?"],
      ["m", "What part of your robot was the hardest to design?"],
      ["m", "How did you make your robot fit within the size limits?"],
      ["m", "What's the most unique feature of your robot?"],
      ["m", "How did you make your mechanism reliable so it works every match?"],
      ["m", "How did you design your robot to be easy for the driver to control?"],
      ["h", "Explain the difference between speed and torque, and how it affected your design."],
      ["h", "Why is your robot's center of gravity where it is? How does that affect stability?"],
      ["h", "If you could add one more motor, where would you put it and why?"],
      ["h", "Did you use any math or calculations when designing your robot? Give me an example."]
    ]
  },
  {
    id: "build", name: "Robot Build", icon: "🔧",
    desc: "Build quality, sturdiness, wire management, and repairs.",
    lookFor: ["Sturdy, clean construction", "Thoughtful wire management", "Easy to maintain and repair"],
    q: [
      ["e", "Who built the robot, and how did you split up the building work?"],
      ["e", "What's your favorite part of the robot that you personally built?"],
      ["m", "How did you make your robot strong and sturdy?"],
      ["m", "How do you manage the wires on your robot so they don't get caught?"],
      ["m", "What did you do to reduce friction in your robot?"],
      ["m", "How easy is it to repair your robot if something breaks during a competition?"],
      ["m", "Did anything on your robot break during a competition? How did you fix it?"],
      ["m", "What building techniques did you learn this season?"],
      ["m", "Why did you use these specific beams, plates, or connectors in this spot?"],
      ["h", "How did you decide where to place the brain and battery on your robot?"],
      ["h", "How do you check your robot before every match to make sure it's ready?"],
      ["h", "What did you do to make your robot lighter or better balanced?"]
    ]
  },
  {
    id: "programming", name: "Programming & Autonomous", icon: "💻",
    desc: "VEXcode IQ, autonomous routines, driver control code, and debugging.",
    lookFor: ["Students can explain their own code", "Uses loops, functions, variables, sensors", "Systematic testing and debugging"],
    q: [
      ["e", "What programming language or software do you use — VEXcode IQ Blocks, Python, or C++?"],
      ["e", "Who on the team does the programming, and how did they learn?"],
      ["m", "Can you walk me through your autonomous program step by step?"],
      ["m", "How do you test and debug your code when the robot doesn't do what you expect?"],
      ["m", "Do you use any loops, functions, or My Blocks in your code? Why?"],
      ["m", "How did you program the controller for driver control? Why did you map the buttons that way?"],
      ["m", "How many versions of your autonomous code have you made? What changed?"],
      ["m", "How do you save and organize different versions of your programs?"],
      ["m", "How long does your autonomous run take, and how did you make it faster?"],
      ["m", "Does everyone on the team understand the code? How do you share what you know?"],
      ["h", "How do you make your autonomous run the same way every time?"],
      ["h", "How does your code handle mistakes, like if the robot gets bumped or misses a game piece?"],
      ["h", "Explain a tricky bug you found and how you fixed it."],
      ["h", "Did you use variables in your code? What do they store, and why?"],
      ["h", "How do you make the robot turn accurately? Do you use the brain's gyro or inertial sensor?"],
      ["h", "If you had one more week, what would you improve in your code?"]
    ]
  },
  {
    id: "sensors", name: "Sensors", icon: "📡",
    desc: "How your robot senses the world to be more accurate and consistent.",
    lookFor: ["Knows what each sensor measures", "Chose sensors over timing for a reason", "Tested sensor readings"],
    q: [
      ["e", "What sensors does your robot use?"],
      ["m", "How does the distance sensor or bumper switch help your robot?"],
      ["m", "Did you use the brain's built-in gyro or inertial sensor? What for?"],
      ["m", "How did you test that your sensors were giving correct readings?"],
      ["m", "Do you use the optical or color sensor? How does it work?"],
      ["m", "How do the motor encoders help you move exact distances?"],
      ["h", "Why did you choose to use a sensor instead of just timing in your autonomous?"],
      ["h", "What problems did you have with sensors, and how did you solve them?"],
      ["h", "Have you tried the AI Vision Sensor? How could it help your robot?"],
      ["h", "If you could add one more sensor, which would it be and how would you use it?"]
    ]
  },
  {
    id: "driving", name: "Driving & Skills", icon: "🎮",
    desc: "Driver practice, Robot Skills runs, and match-day communication.",
    lookFor: ["Regular, tracked practice", "Driver feedback improves the robot", "Calm communication under pressure"],
    q: [
      ["e", "Who drives the robot, and how did you choose the driver?"],
      ["e", "Does more than one person drive? How do you switch drivers in a match?"],
      ["m", "How much do you practice driving each week?"],
      ["m", "What is your best Driver Skills score, and how have you improved it?"],
      ["m", "How do the drivers communicate with each other during a match?"],
      ["m", "What do you do when something goes wrong in the middle of a match?"],
      ["m", "How does the driver stay calm under pressure?"],
      ["m", "Do you have a planned route for Driver Skills? How did you come up with it?"],
      ["h", "How do you track your practice scores to see if you're improving?"],
      ["h", "How did you change the robot or the controls based on driver feedback?"]
    ]
  },
  {
    id: "testing", name: "Testing & Problem Solving", icon: "🧪",
    desc: "How you find problems, test fixes, and use data.",
    lookFor: ["Repeated, fair tests", "Uses data, not guesses", "Finds root causes"],
    q: [
      ["e", "How do you test your robot?"],
      ["m", "What was the biggest problem your robot had, and how did you fix it?"],
      ["m", "How do you know when a change actually made the robot better?"],
      ["m", "How many times do you run a test before you trust the result?"],
      ["m", "What do you do when the team gets stuck on a problem?"],
      ["m", "What's the most recent change you made to your robot, and why?"],
      ["m", "What's a problem you haven't solved yet? What's your plan?"],
      ["h", "Tell me about a time a fix caused a new problem. What did you do?"],
      ["h", "Do you keep data from your tests? Can you share some numbers?"],
      ["h", "How do you figure out the root cause of a problem instead of just guessing?"]
    ]
  },
  {
    id: "creativity", name: "Creativity & Innovation", icon: "💡",
    desc: "Original ideas and creative solutions.",
    lookFor: ["Original, team-made ideas", "Creative problem solving", "Can explain where ideas came from"],
    q: [
      ["m", "What is the most creative idea on your robot?"],
      ["m", "Did your team invent anything you haven't seen on other robots?"],
      ["m", "Where do your best ideas come from?"],
      ["m", "What's a creative solution you came up with to save time or parts?"],
      ["m", "How do you make sure quieter team members share their creative ideas?"],
      ["h", "Tell me about an idea that seemed crazy at first but ended up working."],
      ["h", "How did you take a common design and improve it in your own way?"],
      ["h", "If you could build anything for this game with unlimited parts, what would it be?"]
    ]
  },
  {
    id: "management", name: "Team & Project Management", icon: "🗓️",
    desc: "Planning, schedules, goals, and organization.",
    lookFor: ["Goals and timelines", "Organized meetings and resources", "Adjusts when behind"],
    q: [
      ["e", "How does your team stay organized?"],
      ["m", "Did you make a schedule or timeline for the season? How did you stick to it?"],
      ["m", "How do you decide what to work on at each meeting?"],
      ["m", "How do you keep track of your parts and tools?"],
      ["m", "How do you set goals for each competition?"],
      ["m", "How do you make sure everyone learns different skills, not just one job?"],
      ["m", "Who makes the final decisions on your team, and how?"],
      ["h", "What did you do when you fell behind schedule?"],
      ["h", "How do you balance robotics with school, sports, and other activities?"],
      ["h", "How did you plan ahead to be ready for this competition?"]
    ]
  },
  {
    id: "teamwork", name: "Teamwork & Communication", icon: "🤝",
    desc: "Collaboration inside your team and with alliance partners.",
    lookFor: ["Resolves disagreements well", "Includes every voice", "Works well with alliance partners"],
    q: [
      ["e", "How do you work together as a team?"],
      ["m", "Tell me about a time your team disagreed. How did you solve it?"],
      ["m", "How do you make sure everyone's voice is heard?"],
      ["m", "How do you work with your alliance partner in teamwork matches?"],
      ["m", "What do you talk about with your alliance partner before a match?"],
      ["m", "What does good teamwork look like to you?"],
      ["m", "What happens if someone on the team isn't participating?"],
      ["m", "How do you celebrate when things go well, and support each other when they don't?"],
      ["h", "Tell me about a time you helped another team at a competition."],
      ["h", "How has your team gotten better at working together since the start of the season?"],
      ["h", "How did you adapt when you were paired with a robot very different from yours?"]
    ]
  },
  {
    id: "student", name: "Student-Centered & Sportsmanship", icon: "🏅",
    desc: "Showing the work is yours, and treating everyone with respect.",
    lookFor: ["Students did the work", "Can explain every part themselves", "Respect and sportsmanship"],
    q: [
      ["e", "Who designed, built, and programmed this robot?"],
      ["e", "What have you learned from other teams this season?"],
      ["m", "What role do adults or mentors play on your team?"],
      ["m", "What was something you figured out entirely on your own as a team?"],
      ["m", "What does sportsmanship mean to your team?"],
      ["m", "How do you treat other teams at a competition?"],
      ["m", "In your own words, what does it mean to be respectful and professional in robotics?"],
      ["h", "If your mentor wasn't here, could you explain and fix every part of the robot? Tell me how."],
      ["h", "Tell me about a time you showed good sportsmanship even when it was hard."]
    ]
  },
  {
    id: "outreach", name: "STEM Outreach & Community", icon: "🌍",
    desc: "Sharing STEM, inspiring others, and team spirit.",
    lookFor: ["Real outreach examples", "Impact on others", "Positive energy and spirit"],
    q: [
      ["e", "What STEM skills have you learned from VEX IQ?"],
      ["m", "Has your team done any outreach to share STEM with others?"],
      ["m", "How have you helped younger students or new teams get into robotics?"],
      ["m", "How do you raise money or get support for your team?"],
      ["m", "What would you tell a friend who is thinking about joining robotics?"],
      ["m", "Do you share your designs or knowledge online or with other teams?"],
      ["m", "How do you keep your energy and positive attitude high at events?"],
      ["h", "How has being on a robotics team changed how you think about STEM careers?"],
      ["h", "What impact has your team had on your school or community?"]
    ]
  },
  {
    id: "reflection", name: "Reflection & Goals", icon: "🪞",
    desc: "What you learned and where you're headed next.",
    lookFor: ["Honest reflection", "Specific lessons learned", "Clear next steps"],
    q: [
      ["e", "What is the most important thing you learned this season?"],
      ["e", "Is there anything else you'd like the judges to know about your team?"],
      ["m", "What would you do differently if you started the season again?"],
      ["m", "What are your team's goals for the rest of the season?"],
      ["m", "What skills have you improved the most since you joined the team?"],
      ["m", "How will you use what you learned in robotics outside of robotics?"],
      ["m", "How do you plan to get ready for the next competition?"],
      ["h", "What was your biggest failure this season, and what did it teach you?"],
      ["h", "What is the next big improvement you're planning for your robot?"]
    ]
  },
  {
    id: "curveball", name: "Curveball Questions", icon: "🌀",
    desc: "Unexpected questions that test how well you think on your feet.",
    lookFor: ["Stays calm", "Answers with real examples", "Shows personality"],
    q: [
      ["h", "If you had to remove one part from your robot right now, which would hurt it the least?"],
      ["h", "Convince me in 30 seconds that your robot deserves an award."],
      ["h", "What question were you hoping we'd ask you? Go ahead and answer it."],
      ["h", "Explain how your robot works as if I'm a kindergartener."],
      ["h", "What's the weirdest problem your robot ever had?"],
      ["h", "If you could trade one part of your robot with another team's, what would it be and why?"],
      ["h", "If your robot could talk, what would it say about your team?"],
      ["h", "Pick one teammate and tell me something they did that made the team better."],
      ["h", "What's something you believed at the start of the season that turned out to be wrong?"],
      ["h", "If you were the judge, what would you ask your team?"]
    ]
  }
];

// Interview modes. `plan` = [categoryId, count] picked in order; `pool` = categories sampled randomly.
window.MODES = [
  {
    id: "full", name: "Full Judge Interview", icon: "🏆", minutes: 10, defaultCount: 12,
    desc: "A realistic, well-rounded interview across every judged area.",
    plan: [["intro", 1], ["edp", 2], ["notebook", 1], ["strategy", 1], ["design", 1], ["build", 1], ["programming", 1], ["testing", 1], ["teamwork", 1], ["management", 1], ["student", 1], ["creativity", 1], ["sensors", 1], ["outreach", 1], ["reflection", 1]],
    closer: true
  },
  {
    id: "quick", name: "Quick Practice", icon: "⚡", minutes: 5, defaultCount: 6,
    desc: "Six mixed questions — great for a warm-up before judging.",
    pool: ["edp", "strategy", "design", "build", "programming", "testing", "teamwork", "management"], intro: true
  },
  {
    id: "design-award", name: "Design & Excellence Focus", icon: "📐", minutes: 10, defaultCount: 10,
    desc: "Design process, notebook, project management, and testing.",
    pool: ["edp", "notebook", "management", "testing", "teamwork"], intro: true, closer: true
  },
  {
    id: "think", name: "Think Award Focus", icon: "🧠", minutes: 8, defaultCount: 9,
    desc: "Programming, autonomous, sensors, and debugging.",
    pool: ["programming", "sensors", "testing", "strategy"], intro: true
  },
  {
    id: "robot", name: "Amaze / Build / Create Focus", icon: "🛠️", minutes: 8, defaultCount: 9,
    desc: "Robot design, build quality, and creative mechanisms.",
    pool: ["design", "build", "creativity", "testing"], intro: true
  },
  {
    id: "character", name: "Teamwork & Character", icon: "💙", minutes: 8, defaultCount: 9,
    desc: "Teamwork, sportsmanship, outreach, and spirit (Judges, Inspire, Energy).",
    pool: ["teamwork", "student", "outreach", "reflection", "management"], intro: true
  },
  {
    id: "rapid", name: "Rapid Fire", icon: "🔥", minutes: 6, defaultCount: 15, noFollowups: true,
    desc: "Fifteen fast questions, no follow-ups. Practice short, sharp answers.",
    pool: ["intro", "edp", "notebook", "strategy", "design", "build", "programming", "sensors", "driving", "testing", "creativity", "management", "teamwork", "student", "outreach", "reflection"]
  },
  {
    id: "curveball", name: "Curveball Challenge", icon: "🌀", minutes: 8, defaultCount: 8,
    desc: "Tough and unexpected questions to build confidence.",
    pool: ["curveball", "curveball", "edp", "design", "programming", "testing"], hardBias: true
  },
  {
    id: "custom", name: "Custom", icon: "🎛️", minutes: 10, defaultCount: 10,
    desc: "Pick exactly which categories you want to practice.",
    pool: null
  }
];
