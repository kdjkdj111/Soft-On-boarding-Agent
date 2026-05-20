package com.vector.onboarding.global.config;

import org.hibernate.boot.model.naming.CamelCaseToUnderscoresNamingStrategy;
import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

public class CustomPhysicalNamingStrategy extends CamelCaseToUnderscoresNamingStrategy {

    @Override
    public Identifier toPhysicalTableName(Identifier name, JdbcEnvironment jdbcEnvironment) {
        if (name != null && name.getText().equalsIgnoreCase("ComponentNodes")) {
            // 대소문자를 정확히 유지하기 위해 따옴표(Quoted) 처리하여 반환합니다.
            return Identifier.toIdentifier("ComponentNodes", true);
        }
        return super.toPhysicalTableName(name, jdbcEnvironment);
    }
}
