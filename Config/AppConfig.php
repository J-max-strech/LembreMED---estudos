<?php

class AppConfig {
    private array $values;

    public function __construct(array $values) {
        $this->values = $values;
    }

    public static function load(string $path = __DIR__ . '/../config.ini'): self {
        $values = [
            'database_dsn' => 'sqlite:' . __DIR__ . '/../database.sqlite',
            'database_user' => null,
            'database_password' => null,
        ];

        if (is_file($path)) {
            $iniValues = parse_ini_file($path, false, INI_SCANNER_TYPED);
            if ($iniValues !== false) {
                $values = array_merge($values, $iniValues);
            }
        }

        foreach ($values as $key => $defaultValue) {
            $envValue = getenv(strtoupper($key));
            if ($envValue !== false) {
                $values[$key] = $envValue;
            }
        }

        return new self($values);
    }

    public function get(string $key): ?string {
        return isset($this->values[$key]) ? (string)$this->values[$key] : null;
    }
}
