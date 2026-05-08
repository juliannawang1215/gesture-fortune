export interface Fortune {
  id: string;
  quote: string;
  enQuote: string;
  explanation: string;
  enExplanation: string;
  advice: string;
  enAdvice: string;
}

export const fortunes: Fortune[] = [
  {
    id: "1",
    quote: "风生水起，好运将至",
    enQuote: "The wind rises, the water flows; good fortune approaches.",
    explanation: "近期的停滞和困难即将过去，事物将朝着积极的方向快速发展。",
    enExplanation: "Recent stagnation and difficulties are passing. Things will rapidly develop in a positive direction.",
    advice: "保持开放的心态，拥抱即将到来的变化，顺水推舟即可事半功倍。",
    enAdvice: "Keep an open mind and embrace upcoming changes. Go with the flow to achieve more with less effort."
  },
  {
    id: "2",
    quote: "潜龙勿用，静待时机",
    enQuote: "The hidden dragon must not act; await the right time.",
    explanation: "目前不是展现自己或急于求成的最好时机，你的力量仍在积累之中。",
    enExplanation: "Now is not the best time to show off or rush for success. Your strength is still accumulating.",
    advice: "低调行事，默默提升自己的能力，不要因为一时的沉寂而感到焦虑。",
    enAdvice: "Keep a low profile and silently improve your abilities. Do not be anxious over temporary obscurity."
  },
  {
    id: "3",
    quote: "否极泰来，拨云见日",
    enQuote: "Out of the depths of sorrow comes joy; the clouds part to reveal the sun.",
    explanation: "最糟糕的时期已经过去或者即将结束，光明和好运即刻降临。",
    enExplanation: "The worst times have passed or are ending. Brightness and good luck will arrive immediately.",
    advice: "坚持住最后的考验，丢掉消极的念头，带着微笑迎接新的清晨。",
    enAdvice: "Hold on through the final test, discard negative thoughts, and welcome a new dawn with a smile."
  },
  {
    id: "4",
    quote: "镜花水月，慎辨真伪",
    enQuote: "Flowers in a mirror, moon in the water; distinguish truth from illusion.",
    explanation: "眼前的诱惑或看似美好的机会可能有虚假成分，不可盲目投入。",
    enExplanation: "Current temptations or seemingly wonderful opportunities may contain falsehoods. Do not commit blindly.",
    advice: "面对重大决定时，保持冷静的头脑，多做调查，不要被表面现象迷惑。",
    enAdvice: "Keep a calm mind when making major decisions. Do more research and don't be deceived by appearances."
  },
  {
    id: "5",
    quote: "山重水复，柳暗花明",
    enQuote: "Mountains multiply, streams double back; amid the dark shadows of willows, bright flowers appear.",
    explanation: "在看似无路可走的时候，只要坚持探索，就会出现意想不到的转机。",
    enExplanation: "When there seems to be no way out, unexpected turning points will appear as long as you keep exploring.",
    advice: "遇到瓶颈时换个角度思考，不要轻易放弃，转机往往藏在下一次尝试中。",
    enAdvice: "Think from another angle when facing a bottleneck. Don't give up easily; the turning point usually hides in the next attempt."
  },
  {
    id: "6",
    quote: "千里之行，始于足下",
    enQuote: "A journey of a thousand miles begins with a single step.",
    explanation: "宏伟的目标不是凭空实现的，当下最需要的是踏出第一步。",
    enExplanation: "Grand goals are not achieved out of thin air. What is most needed right now is to take the first step.",
    advice: "少想多做。把大目标拆解成今天就能完成的小事，立刻行动起来。",
    enAdvice: "Think less, do more. Break grand goals into small tasks you can finish today, and take action immediately."
  },
  {
    id: "7",
    quote: "和气生财，广结善缘",
    enQuote: "Ameability breeds wealth; make good connections.",
    explanation: "近期的人际关系是你事业或生活的关键，和谐的氛围会带来意想不到的利益。",
    enExplanation: "Recent interpersonal relationships are the key to your career or life. A harmonious atmosphere will bring unexpected benefits.",
    advice: "对待他人多一点包容和微笑，主动提供帮助，善意终将回到你身上。",
    enAdvice: "Treat others with more tolerance and smiles. Actively offer help, and goodwill will eventually return to you."
  },
  {
    id: "8",
    quote: "乘风破浪，一往无前",
    enQuote: "Ride the wind and cleave the waves; press forward fearlessly.",
    explanation: "你正处于精力充沛、运势上升的时期，没有什么能阻挡你的步伐。",
    enExplanation: "You are in a period of abundant energy and rising fortune. Nothing can stop your pace.",
    advice: "大胆去追求你心中的目标，现在是发起冲刺的最佳时刻，相信自己的直觉。",
    enAdvice: "Boldly pursue the goals in your heart. Now is the best time to sprint, trust your intuition."
  },
  {
    id: "9",
    quote: "知足常乐，随遇而安",
    enQuote: "Contentment brings happiness; go with the flow.",
    explanation: "过分追求物质或外界的认可会带来痛苦，当前的拥有已足够带来心灵的平静。",
    enExplanation: "Excessive pursuit of material things or external recognition brings pain. What you currently have is enough for inner peace.",
    advice: "放慢脚步，感恩生命中已有的人和事，花点时间与自己和内心独处。",
    enAdvice: "Slow down, be grateful for the people and things already in your life, and spend time alone with your inner self."
  },
  {
    id: "10",
    quote: "不破不立，破而后立",
    enQuote: "No construction without destruction; destroy first to build later.",
    explanation: "旧的习惯或看似稳定的现状正在限制你的发展，只有打破它们才能迎来新生。",
    enExplanation: "Old habits or a seemingly stable status quo are limiting your development. You can only welcome a new life by breaking them.",
    advice: "勇敢割舍那些不再服务于你成长的事物，无论是感情、工作还是旧观念。",
    enAdvice: "Bravely let go of things that no longer serve your growth, whether relationships, jobs, or old concepts."
  },
  {
    id: "11",
    quote: "水滴石穿，贵在坚持",
    enQuote: "Dripping water wears through stone; persistence is prized.",
    explanation: "短时间内看不到成果是正常的，只有日复一日的积累才能带来质的飞跃。",
    enExplanation: "It is normal not to see results in the short term. Only day-by-day accumulation can bring a qualitative leap.",
    advice: "保持你的节奏，不要被他人的快速成功打乱阵脚，时间会证明你的价值。",
    enAdvice: "Keep your pace and don't be distracted by others' quick successes. Time will prove your worth."
  },
  {
    id: "13",
    quote: "枯木逢春，时来运转",
    enQuote: "A dead tree meets spring; luck turns around.",
    explanation: "经历了漫长的低谷后，终于迎来了生机，运势开始明显好转。",
    enExplanation: "After a long trough, vitality finally arrives, and luck begins to improve significantly.",
    advice: "抓住眼前的机会，重拾对未来的信心，勇敢地迎接新的开端。",
    enAdvice: "Seize the current opportunities, regain confidence in the future, and bravely welcome the new beginning."
  },
  {
    id: "14",
    quote: "居安思危，未雨绸缪",
    enQuote: "Think of danger in times of peace; prepare for a rainy day.",
    explanation: "虽然目前一切顺利，但潜在的风险可能正在暗中积聚。",
    enExplanation: "Although everything is going smoothly now, potential risks may be secretly accumulating.",
    advice: "提前制定备用计划，审视周围的薄弱环节，不要因为安逸而放松警惕。",
    enAdvice: "Make backup plans in advance, review weak surrounding links, and do not relax vigilance due to comfort."
  },
  {
    id: "15",
    quote: "塞翁失马，焉知非福",
    enQuote: "A blessing in disguise; a setback may lead to good fortune.",
    explanation: "刚刚经历的挫折或损失，从长远来看，反而是让你避开更大风险的契机。",
    enExplanation: "The setback or loss you just experienced may actually be an opportunity to avoid greater risks in the long run.",
    advice: "不要在一时的得失上纠结，调整心态，看看失去背后的新收获。",
    enAdvice: "Do not dwell on temporary gains or losses. Adjust your mindset and look at the new gains behind the loss."
  },
  {
    id: "16",
    quote: "三思而行，谋定后动",
    enQuote: "Think thrice before acting; plan thoroughly before moving.",
    explanation: "面对即将到来的抉择，不可凭借冲动行事，必须要有周全的考量。",
    enExplanation: "Faced with upcoming decisions, you must not act impulsively; thorough consideration is required.",
    advice: "多听取长辈或专业人士的意见，权衡利弊，制定了清晰的步骤后再付诸行动。",
    enAdvice: "Listen more to the opinions of elders or professionals, weigh the pros and cons, and formulate clear steps before taking action."
  },
  {
    id: "17",
    quote: "退一步海阔天空",
    enQuote: "Take a step back, and the sea and sky become vast.",
    explanation: "眼前的争执或僵局，只要有一方愿意让步，就会立刻呈现豁然开朗的局面。",
    enExplanation: "For the current dispute or stalemate, as long as one party is willing to yield, a suddenly clear situation will appear.",
    advice: "放下个人的坚持和胜负欲，吃亏是福，给别人台阶也是给自己留后路。",
    enAdvice: "Let go of personal stubbornness and desire to win. Taking a loss is a blessing. Giving others a way out is leaving one for yourself."
  },
  {
    id: "18",
    quote: "破釜沉舟，背水一战",
    enQuote: "Burn the boats; a final stand.",
    explanation: "到了必须做出决断的时刻，没有任何退路，唯有全力以赴才能成功。",
    enExplanation: "The moment of decision has come. With no retreat, only going all out will bring success.",
    advice: "抛弃所有幻想和犹豫，把所有资源投入到当前的目标中，背水一战你会爆发出惊人的潜力。",
    enAdvice: "Abandon all illusions and hesitation. Invest all resources into current goals; a desperate fight unleashes amazing potential."
  },
  {
    id: "19",
    quote: "韬光养晦，厚积薄发",
    enQuote: "Hide your light and nurture your strength; accumulate richly to burst forth.",
    explanation: "当前不宜抛头露面，而应静心沉淀，默默积累力量等待爆发的那一刻。",
    enExplanation: "It is not suitable to be in the limelight now. Calm down, settle, and silently accumulate strength waiting for the moment to erupt.",
    advice: "将精力放在学习和自我提升上，屏蔽外界的喧嚣，时间会给你最好的证明。",
    enAdvice: "Focus your energy on learning and self-improvement, block out external noise, and time will give you the best proof."
  },
  {
    id: "20",
    quote: "宁静致远，淡泊明志",
    enQuote: "Tranquility leads to the distance; indifference clarifies the mind.",
    explanation: "过于浮躁的环境让你迷失了方向，只有回归内心的宁静才能看清前路。",
    enExplanation: "An overly impetuous environment has made you lose direction. Only by returning to inner peace can you see the way ahead.",
    advice: "放下名利的焦灼，做一些让自己静心的事情，比如阅读或散步，答案会自然浮现。",
    enAdvice: "Put down the anxiety of fame and fortune, do things that calm you down, like reading or walking, and answers will emerge."
  },
  {
    id: "21",
    quote: "锦上添花，双喜临门",
    enQuote: "Adding flowers to brocade; double happiness arrives.",
    explanation: "好运正在接踵而至，原本已经很好的事情会变得更好，甚至有意外之喜。",
    enExplanation: "Good luck is coming thick and fast. Things that are already good will get better, perhaps with unexpected surprises.",
    advice: "保持愉悦的心情，可以大胆尝试一些以前想做但没做的事情，现在成功率极高。",
    enAdvice: "Maintain a joyful mood. Boldly try things you wanted but haven't done; the success rate is extremely high now."
  },
  {
    id: "22",
    quote: "峰回路转，别有洞天",
    enQuote: "The path winds through peaks; there lies a different world.",
    explanation: "看似走到了死胡同，但只要拐个弯，就会发现一片全新的天地和机遇。",
    enExplanation: "It seems you've reached a dead end, but just turn a corner and you will find a brand-new world of opportunities.",
    advice: "不要被思维定式束缚，尝试一些打破常规的方法，或者向不同领域的去请教。",
    enAdvice: "Don't be bound by fixed thinking. Try unconventional methods or seek advice from entirely different fields."
  },
  {
    id: "23",
    quote: "千锤百炼，真金不怕",
    enQuote: "Forged a thousand times; true gold fears no fire.",
    explanation: "目前的考验和压力是在塑造你，证明你实力的时刻已经到来。",
    enExplanation: "Current tests and pressures are shaping you. The moment to prove your strength has arrived.",
    advice: "不要畏惧困难和别人的质疑，用实力和结果说话，你远比你想象的要强大。",
    enAdvice: "Do not fear difficulties or others' doubts. Let your strength and results speak; you are much stronger than you think."
  },
  {
    id: "24",
    quote: "迎刃而解，势如破竹",
    enQuote: "Like splitting bamboo; problems are easily solved.",
    explanation: "长期困扰你的难题即将找到突破口，一旦开始解决，后续的一切都会变得非常顺利。",
    enExplanation: "Long-troubling problems will soon find a breakthrough. Once started, everything else will proceed smoothly.",
    advice: "抓住关键环节，一鼓作气解决问题，不要拖泥带水给问题死灰复燃的机会。",
    enAdvice: "Grasp the key link and solve the problem in one go. Don't procrastinate and give it a chance to resurface."
  },
  {
    id: "25",
    quote: "滴水之恩，涌泉相报",
    enQuote: "A drop of kindness deserves a fountain of return.",
    explanation: "曾经帮助过你的人或是结下的善缘，即将在这个时候为你带来关键的回报。",
    enExplanation: "Those you helped or good connections made will bring you crucial returns at this time.",
    advice: "心存感激，主动联系那些曾经支持过你的人，同时也要力所能及地帮助他人。",
    enAdvice: "Be grateful. Actively contact those who supported you, and help others within your capacity."
  },
  {
    id: "26",
    quote: "有志竟成，破浪乘风",
    enQuote: "Where there is a will, there is a way; ride the wind and break the waves.",
    explanation: "只要你有足够坚定的信念，就没有什么困难能够阻挡你实现心中的理想。",
    enExplanation: "As long as you have firm beliefs, no difficulties can prevent you from realizing your ideals.",
    advice: "明确你的核心目标，每天为之付诸努力，不要因为旁人的眼光而改变初衷。",
    enAdvice: "Clarify your core goals and put effort into them daily. Don't change your original intention due to others' views."
  },
  {
    id: "27",
    quote: "种瓜得瓜，种豆得豆",
    enQuote: "As you sow, so shall you reap.",
    explanation: "因果循环，你过去的付出和努力，现在终于到了收获季节。",
    enExplanation: "Karma cycles; your past efforts and contributions have finally reached the harvest season.",
    advice: "坦然接受属于你的回报，如果是恶果，也要勇于承担并从现在开始重新播种善良。",
    enAdvice: "Calmly accept what belongs to you. If bearing bad fruit, bravely admit it and start planting goodness anew."
  },
  {
    id: "28",
    quote: "鹏程万里，展翅高飞",
    enQuote: "A journey of a ten thousand miles; soaring high.",
    explanation: "你的才华和能力得到了更广阔的平台，即将迎来事业或学业的大飞跃。",
    enExplanation: "Your talents and abilities have gained a broader platform, ushering a huge leap in career or studies.",
    advice: "不要害怕挑战更高难度的事情，放开手脚去拼搏，你的舞台比你想象的要大得多。",
    enAdvice: "Don't fear challenging harder tasks. Let go and strive; your stage is much larger than you imagined."
  },
  {
    id: "29",
    quote: "春华秋实，硕果累累",
    enQuote: "Spring flowers, autumn fruits; an abundant harvest.",
    explanation: "经过漫长周期的辛勤耕耘，你的项目或目标即将取得丰硕的成果。",
    enExplanation: "After a long cycle of hard work, your project or goal is about to achieve fruitful results.",
    advice: "好好享受成功的喜悦，同时不要忘了总结经验，为下一个周期的播种做好准备。",
    enAdvice: "Enjoy the joy of success, but don't forget to summarize experiences and prepare for sowing in the next cycle."
  },
  {
    id: "30",
    quote: "顺水推舟，游刃有余",
    enQuote: "Pushing the boat with the current; doing things with ease.",
    explanation: "外界的形势对你非常有利，做起事来毫不费力，就像水到渠成一般顺畅。",
    enExplanation: "The external situation is highly favorable to you. Things are effortless and proceed smoothly.",
    advice: "借助这股东风，顺势而为，可以把之前拖延或觉得困难的任务在此时一并解决。",
    enAdvice: "Leverage this tailwind and go with the flow. Resolve previously delayed or difficult tasks now."
  }
];
