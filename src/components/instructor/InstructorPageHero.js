function InstructorPageHero({ title, subtitle, kicker = "Instructor Attendance Hub" }) {
  return (
    <section className="dash-hero instructor-hero">
      <div>
        <p className="dash-kicker">{kicker}</p>
        <h3 className="dashtext">{title}</h3>
        <p className="dash-subtext">{subtitle}</p>
      </div>
      <div className="dash-hero-pulse" aria-hidden="true">
        <span />  
        <span />
        <span />
      </div>
    </section>
  );
}

export default InstructorPageHero;
