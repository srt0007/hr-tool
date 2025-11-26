const Anthropic = require('@anthropic-ai/sdk');
const config = require('./env');

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: config.claude.apiKey,
});

/**
 * Analyze resume against job description using Claude
 */
async function analyzeResume(jobDescription, resumeText, candidateName) {
  try {
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzing resumes for job positions.

Job Description:
${jobDescription}

Resume for candidate: ${candidateName}
${resumeText}

Please analyze this resume against the job description and provide:
1. Match Score (0-100%): How well the candidate matches the job requirements
2. Key Skills Matched: List the important skills from the job description that the candidate has
3. Missing Skills: Important skills from job description that are not evident in the resume
4. Summary: A brief 2-3 sentence summary of why this candidate is or isn't a good fit

Respond in the following JSON format:
{
  "matchScore": <number 0-100>,
  "keySkillsMatched": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "summary": "brief summary text"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract the text content from Claude's response
    const responseText = message.content[0].text;

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Could not parse Claude response');
  } catch (error) {
    console.error('Error analyzing resume with Claude:', error);
    throw error;
  }
}

module.exports = {
  anthropic,
  analyzeResume,
};
